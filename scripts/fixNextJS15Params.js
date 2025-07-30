const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results = results.concat(findFiles(filePath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to fix params in page components
function fixPageParams(content, filePath) {
  // Only fix page components (not API routes)
  if (filePath.includes('/api/')) {
    return content;
  }
  
  // Fix page component params
  let modified = content;
  
  // Pattern 1: { params }: { params: { ... } }
  modified = modified.replace(
    /export default function \w+\(\s*\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{([^}]+)\}\s*\}\)/g,
    'export default function $&({ params }: { params: Promise<{ $1 }> })'
  );
  
  // Pattern 2: async function with params
  modified = modified.replace(
    /export async function \w+\(\s*\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{([^}]+)\}\s*\}\)/g,
    'export async function $&({ params }: { params: Promise<{ $1 }> })'
  );
  
  // Pattern 3: function with params destructuring
  modified = modified.replace(
    /function \w+\(\s*\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{([^}]+)\}\s*\}\)/g,
    'function $&({ params }: { params: Promise<{ $1 }> })'
  );
  
  return modified;
}

// Main execution
const appDir = path.join(__dirname, '..', 'app');
const files = findFiles(appDir);

console.log('Fixing Next.js 15 params in page components...');

files.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const modified = fixPageParams(content, filePath);
    
    if (modified !== content) {
      fs.writeFileSync(filePath, modified, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('Done!'); 