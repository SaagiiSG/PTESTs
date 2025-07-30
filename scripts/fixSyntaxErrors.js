const fs = require('fs');

// List of files that need fixing
const filesToFix = [
  'app/api/debug-session/route.ts',
  'app/api/profile/me/route.ts',
  'app/api/profile/purchase-history/route.ts',
  'app/api/profile/purchased-courses/route.ts',
  'app/api/profile/update/route.ts',
  'app/api/protected-tests/[id]/route.ts',
  'app/api/protected-tests/route.ts',
  'app/api/purchase/route.ts',
  'app/api/tests/route.ts',
  'app/api/tests/[id]/taken.ts'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the broken import statement
    content = content.replace(
      /import \{\s*\/\/ Prevent execution during build time\s*if \(process\.env\.NODE_ENV === 'production' && !process\.env\.MONGODB_URI\) \{\s*return NextResponse\.json\(\{ error: 'Service temporarily unavailable' \}, \{ status: 503 \}\);\s*\}\s*NextResponse \} from ['"][^'"]+['"];?/g,
      "import { NextResponse } from 'next/server';"
    );
    
    // Add prevention code to each function
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
    console.log(`✅ Fixed ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Fix all files
console.log('Fixing syntax errors in API routes...\n');
filesToFix.forEach(file => {
  fixFile(file);
});

console.log('\n✅ All syntax errors fixed!'); 