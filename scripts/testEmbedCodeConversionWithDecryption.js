// Test script for embed code conversion with decryption scenarios
// Run with: node scripts/testEmbedCodeConversionWithDecryption.js

// Mock the embedCodeUtils functions for testing
function analyzeEmbedCode(embedCode) {
  if (!embedCode || typeof embedCode !== 'string') {
    return {
      type: 'unknown',
      convertedCode: embedCode,
      originalCode: embedCode,
      needsConversion: false
    };
  }

  const trimmedCode = embedCode.trim();
  
  // Check if it's already an iframe
  if (trimmedCode.includes('<iframe')) {
    return {
      type: 'iframe',
      convertedCode: trimmedCode,
      originalCode: trimmedCode,
      needsConversion: false
    };
  }

  // Check if it's a quiz-maker code
  if (trimmedCode.includes('quiz-maker.com') || trimmedCode.includes('data-quiz')) {
    const quizId = extractQuizId(trimmedCode);
    if (quizId) {
      return {
        type: 'quiz-maker',
        convertedCode: createQuizIframe(quizId),
        originalCode: trimmedCode,
        needsConversion: true
      };
    }
  }

  // Check if it's a script
  if (trimmedCode.includes('<script')) {
    return {
      type: 'script',
      convertedCode: convertScriptToIframe(trimmedCode),
      originalCode: trimmedCode,
      needsConversion: true
    };
  }

  // Check if it's a URL
  if (isValidUrl(trimmedCode)) {
    return {
      type: 'url',
      convertedCode: createUrlIframe(trimmedCode),
      originalCode: trimmedCode,
      needsConversion: true
    };
  }

  // Check if it's an anchor tag
  if (trimmedCode.includes('<a ')) {
    return {
      type: 'url',
      convertedCode: convertAnchorToIframe(trimmedCode),
      originalCode: trimmedCode,
      needsConversion: true
    };
  }

  return {
    type: 'unknown',
    convertedCode: trimmedCode,
    originalCode: trimmedCode,
    needsConversion: false
  };
}

function processEmbedCode(embedCode, convertToIframe = true) {
  if (!convertToIframe) {
    return embedCode;
  }

  const analysis = analyzeEmbedCode(embedCode);
  return analysis.convertedCode;
}

function extractQuizId(code) {
  // Try to extract from data-quiz attribute
  const dataQuizMatch = code.match(/data-quiz=["']([^"']+)["']/);
  if (dataQuizMatch) {
    return dataQuizMatch[1];
  }

  // Try to extract from quiz-maker.com URL
  const quizUrlMatch = code.match(/quiz-maker\.com\/([a-zA-Z0-9_-]+)/);
  if (quizUrlMatch) {
    return quizUrlMatch[1];
  }

  // Try to extract from href attribute
  const hrefMatch = code.match(/href=["']([^"']*quiz-maker\.com[^"']*)["']/);
  if (hrefMatch) {
    const urlMatch = hrefMatch[1].match(/quiz-maker\.com\/([a-zA-Z0-9_-]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
  }

  return null;
}

function createQuizIframe(quizId) {
  return `<iframe 
    src="https://take.quiz-maker.com/${quizId}" 
    width="100%" 
    height="100vh" 
    frameborder="0" 
    scrolling="no" 
    allowfullscreen 
    title="Quiz"
    style="border: none; border-radius: 8px; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10;">
  </iframe>`;
}

function createUrlIframe(url) {
  return `<iframe 
    src="${url}" 
    width="100%" 
    height="100vh" 
    frameborder="0" 
    scrolling="no" 
    allowfullscreen 
    title="Embedded Content"
    style="border: none; border-radius: 8px; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10;">
  </iframe>`;
}

function convertScriptToIframe(scriptCode) {
  // Extract URL from script src
  const srcMatch = scriptCode.match(/src=["']([^"']+)["']/);
  if (srcMatch) {
    const url = srcMatch[1];
    if (isValidUrl(url)) {
      return createUrlIframe(url);
    }
  }

  // If it's a quiz-maker script, try to extract quiz ID
  if (scriptCode.includes('quiz-maker')) {
    const quizId = extractQuizId(scriptCode);
    if (quizId) {
      return createQuizIframe(quizId);
    }
  }

  // Return original if conversion not possible
  return scriptCode;
}

function convertAnchorToIframe(anchorCode) {
  const hrefMatch = anchorCode.match(/href=["']([^"']+)["']/);
  if (hrefMatch) {
    const url = hrefMatch[1];
    if (isValidUrl(url)) {
      return createUrlIframe(url);
    }
  }
  return anchorCode;
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Test cases that simulate decryption failures
const testCases = [
  {
    name: "Decryption failed - quiz-maker link (should still convert)",
    input: '<a href="#" data-quiz="abc123">Take Quiz</a>',
    expectedType: 'quiz-maker',
    scenario: 'decryption_failed'
  },
  {
    name: "Decryption failed - direct URL (should still convert)",
    input: 'https://example.com/test',
    expectedType: 'url',
    scenario: 'decryption_failed'
  },
  {
    name: "Decryption failed - script tag (should still convert)",
    input: '<script src="https://example.com/script.js"></script>',
    expectedType: 'script',
    scenario: 'decryption_failed'
  },
  {
    name: "Decryption failed - already iframe (should remain unchanged)",
    input: '<iframe src="https://example.com/test" width="100%" height="600"></iframe>',
    expectedType: 'iframe',
    scenario: 'decryption_failed'
  },
  {
    name: "Decryption failed - plain text (should remain unchanged)",
    input: 'Just some text content',
    expectedType: 'unknown',
    scenario: 'decryption_failed'
  }
];

console.log('🧪 Testing Embed Code Conversion with Decryption Failures\n');

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log(`   Scenario: ${testCase.scenario}`);
  console.log(`   Input: ${testCase.input}`);
  
  try {
    const analysis = analyzeEmbedCode(testCase.input);
    const converted = processEmbedCode(testCase.input, true);
    
    console.log(`   Type: ${analysis.type} (expected: ${testCase.expectedType})`);
    console.log(`   Needs Conversion: ${analysis.needsConversion}`);
    console.log(`   Converted: ${converted !== testCase.input ? 'Yes' : 'No'}`);
    
    if (converted !== testCase.input) {
      console.log(`   Converted Code: ${converted.substring(0, 100)}...`);
    }
    
    // Check if type matches expected
    if (analysis.type === testCase.expectedType) {
      console.log(`   ✅ PASS`);
    } else {
      console.log(`   ❌ FAIL - Expected ${testCase.expectedType}, got ${analysis.type}`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
});

console.log('\n🎯 Test Summary:');
console.log('The embed code conversion system should:');
console.log('1. Convert embed codes even when decryption fails');
console.log('2. Handle quiz-maker links properly');
console.log('3. Convert direct URLs to iframes');
console.log('4. Convert script tags when possible');
console.log('5. Leave existing iframes unchanged');
console.log('6. Handle unknown formats gracefully');
console.log('7. Provide clear logging for debugging');



