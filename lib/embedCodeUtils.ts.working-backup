/**
 * Utility functions for processing and converting embed codes
 */

export interface EmbedCodeInfo {
  type: 'iframe' | 'script' | 'url' | 'quiz-maker' | 'unknown';
  convertedCode: string;
  originalCode: string;
  needsConversion: boolean;
}

/**
 * Converts various embed code formats to standardized iframe format
 */
export function convertEmbedCodeToIframe(embedCode: string): string {
  if (!embedCode || typeof embedCode !== 'string') {
    return embedCode;
  }

  const trimmedCode = embedCode.trim();
  
  // If it's already an iframe, return as is
  if (trimmedCode.includes('<iframe')) {
    return trimmedCode;
  }

  // Handle quiz-maker.com links
  if (trimmedCode.includes('quiz-maker.com') || trimmedCode.includes('data-quiz')) {
    const quizId = extractQuizId(trimmedCode);
    if (quizId) {
      return createQuizIframe(quizId);
    }
  }

  // Handle direct URLs
  if (isValidUrl(trimmedCode)) {
    return createUrlIframe(trimmedCode);
  }

  // Handle script tags
  if (trimmedCode.includes('<script')) {
    return convertScriptToIframe(trimmedCode);
  }

  // Handle anchor tags
  if (trimmedCode.includes('<a ')) {
    return convertAnchorToIframe(trimmedCode);
  }

  // If it's a plain URL without http/https, try to make it one
  if (trimmedCode.includes('.com') || trimmedCode.includes('.org') || trimmedCode.includes('.net')) {
    const url = trimmedCode.startsWith('http') ? trimmedCode : `https://${trimmedCode}`;
    if (isValidUrl(url)) {
      return createUrlIframe(url);
    }
  }

  // Return original if no conversion is possible
  return trimmedCode;
}

/**
 * Extracts quiz ID from various quiz-maker formats
 */
function extractQuizId(code: string): string | null {
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

/**
 * Creates a standardized iframe for quiz-maker
 */
function createQuizIframe(quizId: string): string {
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

/**
 * Creates an iframe for a direct URL
 */
function createUrlIframe(url: string): string {
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

/**
 * Converts script tags to iframe (if possible)
 */
function convertScriptToIframe(scriptCode: string): string {
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

/**
 * Converts anchor tags to iframe
 */
function convertAnchorToIframe(anchorCode: string): string {
  const hrefMatch = anchorCode.match(/href=["']([^"']+)["']/);
  if (hrefMatch) {
    const url = hrefMatch[1];
    if (isValidUrl(url)) {
      return createUrlIframe(url);
    }
  }
  return anchorCode;
}

/**
 * Validates if a string is a valid URL
 */
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Analyzes embed code and returns information about it
 */
export function analyzeEmbedCode(embedCode: string): EmbedCodeInfo {
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

/**
 * Processes embed code and returns the converted version
 * This is the main function to use for embed code conversion
 */
export function processEmbedCode(embedCode: string, convertToIframe: boolean = true): string {
  if (!convertToIframe) {
    return embedCode;
  }

  const analysis = analyzeEmbedCode(embedCode);
  return analysis.convertedCode;
}


