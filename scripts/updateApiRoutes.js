const fs = require('fs');
const path = require('path');

// List of API route files that need updating
const apiRoutes = [
  'app/api/purchase/route.ts',
  'app/api/courses/route.ts',
  'app/api/profile/me/route.ts',
  'app/api/profile/purchased-courses/route.ts',
  'app/api/profile/update/route.ts',
  'app/api/profile/purchase-history/route.ts',
  'app/api/courses/[courseId]/route.ts',
  'app/api/courses/[courseId]/lesson/[lessonIdx]/route.ts',
  'app/api/protected-tests/[id]/route.ts',
  'app/api/protected-tests/route.ts',
  'app/api/auth/verify-code/route.ts',
  'app/api/auth/register/route.ts',
  'app/api/tests/route.ts',
  'app/api/tests/[id]/taken.ts',
  'app/api/debug-session/route.ts'
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace connectMongoose import
    content = content.replace(
      /import \{ connectMongoose \} from ['"]@\/lib\/mongodb['"];?/g,
      "import { safeConnectMongoose } from '@/lib/mongodb';"
    );
    
    // Replace connectMongoose() calls
    content = content.replace(
      /await connectMongoose\(\);?/g,
      `const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }`
    );
    
    // Add dynamic export if not present
    if (!content.includes('export const dynamic')) {
      const importEndIndex = content.lastIndexOf('import');
      const nextLineIndex = content.indexOf('\n', importEndIndex) + 1;
      content = content.slice(0, nextLineIndex) + 
                '\n// Force this route to be dynamic only (not executed during build)\n' +
                'export const dynamic = \'force-dynamic\';\n\n' +
                content.slice(nextLineIndex);
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
        }
      });
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Update all files
console.log('Updating API routes to use safe MongoDB connection...\n');
apiRoutes.forEach(route => {
  updateFile(route);
});

console.log('\n✅ All API routes updated!'); 