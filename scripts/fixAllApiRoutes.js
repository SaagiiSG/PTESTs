const fs = require('fs');
const path = require('path');

// Find all API route files
function findApiRoutes(dir) {
  const routes = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item === 'route.ts' || item === 'route.js') {
        routes.push(fullPath);
      }
    }
  }
  
  scanDirectory('app/api');
  return routes;
}

function updateApiRoute(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Skip files that already have safeConnectMongoose
    if (content.includes('safeConnectMongoose')) {
      console.log(`⏭️  Skipped ${filePath} (already updated)`);
      return;
    }
    
    // Replace connectMongoose import
    if (content.includes('connectMongoose')) {
      content = content.replace(
        /import \{ connectMongoose \} from ['"]@\/lib\/mongodb['"];?/g,
        "import { safeConnectMongoose } from '@/lib/mongodb';"
      );
      modified = true;
    }
    
    // Replace connectMongoose() calls
    if (content.includes('await connectMongoose()')) {
      content = content.replace(
        /await connectMongoose\(\);?/g,
        `const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }`
      );
      modified = true;
    }
    
    // Add dynamic export if not present
    if (!content.includes('export const dynamic')) {
      const importEndIndex = content.lastIndexOf('import');
      const nextLineIndex = content.indexOf('\n', importEndIndex) + 1;
      content = content.slice(0, nextLineIndex) + 
                '\n// Force this route to be dynamic only (not executed during build)\n' +
                'export const dynamic = \'force-dynamic\';\n\n' +
                content.slice(nextLineIndex);
      modified = true;
    }
    
    // Add build-time prevention to each function
    const functionMatches = content.match(/export async function (GET|POST|PUT|DELETE|PATCH)/g);
    if (functionMatches) {
      functionMatches.forEach(match => {
        const funcName = match.split(' ')[2];
        const funcStart = content.indexOf(`export async function ${funcName}`);
        const funcBodyStart = content.indexOf('{', funcStart) + 1;
        
        // Check if prevention code already exists
        const funcBody = content.substring(funcBodyStart);
        if (!funcBody.includes('process.env.NODE_ENV === \'production\'')) {
          const preventionCode = `
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

`;
          content = content.slice(0, funcBodyStart) + preventionCode + content.slice(funcBodyStart);
          modified = true;
        }
      });
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`⏭️  Skipped ${filePath} (no changes needed)`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Find and update all API routes
console.log('Finding all API routes...\n');
const apiRoutes = findApiRoutes('app/api');

console.log(`Found ${apiRoutes.length} API route files:\n`);
apiRoutes.forEach(route => {
  console.log(`  - ${route}`);
});

console.log('\nUpdating API routes to use safe MongoDB connection...\n');
apiRoutes.forEach(route => {
  updateApiRoute(route);
});

console.log('\n✅ All API routes updated!'); 