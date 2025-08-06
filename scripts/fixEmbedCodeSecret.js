const fs = require('fs');
const path = require('path');

async function fixEmbedCodeSecret() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    
    // Read the current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Split into lines
    const lines = envContent.split('\n');
    
    // Find and remove the duplicate EMBED_CODE_SECRET
    let foundFirst = false;
    const filteredLines = lines.filter(line => {
      if (line.startsWith('EMBED_CODE_SECRET=')) {
        if (!foundFirst) {
          foundFirst = true;
          return true; // Keep the first one (with quotes)
        } else {
          console.log('Removing duplicate EMBED_CODE_SECRET:', line);
          return false; // Remove the second one (without quotes)
        }
      }
      return true;
    });
    
    // Write back to file
    const newContent = filteredLines.join('\n');
    fs.writeFileSync(envPath, newContent);
    
    console.log('✅ Fixed duplicate EMBED_CODE_SECRET in .env file');
    console.log('✅ Kept the correct key: bdc1855feb64c42cc4e5811b6004341f51f27885d1b411de9b0bd466ab2380d6');
    
  } catch (error) {
    console.error('Error fixing EMBED_CODE_SECRET:', error);
  }
}

fixEmbedCodeSecret(); 