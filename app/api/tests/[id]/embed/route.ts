import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { decrypt } from '@/lib/encryption';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await params;

    // Connect to database
    const connection = await connectMongoose();
    
    // Find the test using mongoose
    const Test = require('@/app/models/tests').default;
    const test = await Test.findById(testId);
    
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Decrypt the embed code
    const decryptedEmbedCode = decrypt(test.embedCode);
    
    // Check if it's a quiz-maker iframe
    if (decryptedEmbedCode.includes('quiz-maker.com') && decryptedEmbedCode.includes('iframe')) {
      try {
        // Extract the quiz URL from the iframe src
        const srcMatch = decryptedEmbedCode.match(/src="([^"]+)"/);
        if (srcMatch) {
          const quizUrl = srcMatch[1];
          
          // Fetch the quiz content from quiz-maker.com
          const response = await fetch(quizUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          if (response.ok) {
            let htmlContent = await response.text();
            
            // NUCLEAR BACKGROUND REMOVAL - Strip ALL background-related code
            htmlContent = htmlContent.replace(/background="[^"]*"/gi, '');
            htmlContent = htmlContent.replace(/bgcolor="[^"]*"/gi, '');
            htmlContent = htmlContent.replace(/style="[^"]*background[^"]*"/gi, 'style=""');
            htmlContent = htmlContent.replace(/background:\s*[^;]+;?/gi, '');
            htmlContent = htmlContent.replace(/background-color:\s*[^;]+;?/gi, '');
            htmlContent = htmlContent.replace(/background-image:\s*[^;]+;?/gi, '');
            
            // Remove any external stylesheets that might contain backgrounds
            htmlContent = htmlContent.replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, '');
            
            // Inject our nuclear transparency CSS
            const nuclearCSS = `
              <style id="nuclear-transparency">
                /* NUCLEAR BACKGROUND REMOVAL */
                * {
                  background: transparent !important;
                  background-color: transparent !important;
                  background-image: none !important;
                  background-attachment: scroll !important;
                  background-clip: border-box !important;
                  background-origin: padding-box !important;
                  background-position: 0% 0% !important;
                  background-repeat: repeat !important;
                  background-size: auto !important;
                }
                
                /* Force specific elements */
                body, html, div, form, .quiz-container, .question-container, 
                .quiz, .question, .answer, .option, .quiz-content,
                .quiz-maker, .content, .main, .container, .wrapper,
                .panel, .card, .box, .section, .area, .region,
                .block, .element, .component, .widget, .module,
                .unit, .part, .segment, .piece, .chunk, .fragment, .portion,
                [class*="quiz"], [class*="question"], [class*="answer"], [class*="option"],
                [class*="container"], [class*="content"], [class*="wrapper"],
                [class*="panel"], [class*="card"], [class*="box"], [class*="section"],
                [class*="area"], [class*="region"], [class*="block"], [class*="element"],
                [class*="component"], [class*="widget"], [class*="module"], [class*="unit"],
                [class*="part"], [class*="segment"], [class*="piece"], [class*="chunk"],
                [class*="fragment"], [class*="portion"] {
                  background: transparent !important;
                  background-color: transparent !important;
                  background-image: none !important;
                }
                
                /* Remove any background attributes */
                [background], [bgcolor] {
                  background: transparent !important;
                  background-color: transparent !important;
                }
              </style>
            `;
            
            // Inject the CSS into the head
            htmlContent = htmlContent.replace('</head>', `${nuclearCSS}</head>`);
            
            // Also inject JavaScript to force transparency
            const nuclearJS = `
              <script>
                // NUCLEAR JAVASCRIPT OVERRIDE
                (function() {
                  const forceTransparency = () => {
                    const allElements = document.querySelectorAll('*');
                    allElements.forEach(el => {
                      el.style.background = 'transparent !important';
                      el.style.backgroundColor = 'transparent !important';
                      el.style.backgroundImage = 'none !important';
                      el.removeAttribute('background');
                      el.removeAttribute('bgcolor');
                    });
                  };
                  
                  // Apply immediately and repeatedly
                  forceTransparency();
                  setInterval(forceTransparency, 50);
                  
                  // Watch for DOM changes
                  const observer = new MutationObserver(forceTransparency);
                  observer.observe(document.body, { 
                    childList: true, 
                    subtree: true, 
                    attributes: true,
                    attributeFilter: ['style', 'background', 'bgcolor']
                  });
                })();
              </script>
            `;
            
            // Inject the JavaScript before closing body
            htmlContent = htmlContent.replace('</body>', `${nuclearJS}</body>`);
            
            // Convert to data URL to serve as same-origin content
            const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
            
            // Return the cleaned HTML wrapped in our glassmorphism container
            return new NextResponse(`
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Quiz</title>
                <style>
                  body { margin: 0; padding: 0; background: transparent; }
                  .nuclear-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    border-radius: 20px;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                  }
                  .nuclear-wrapper iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                    border-radius: 20px;
                    background: transparent !important;
                  }
                </style>
              </head>
              <body>
                <div class="nuclear-wrapper">
                  <iframe 
                    src="${dataUrl}" 
                    width="100%" 
                    height="100%" 
                    frameborder="0" 
                    scrolling="auto"
                    title="Quiz"
                    style="background: transparent !important;"
                  ></iframe>
                </div>
              </body>
              </html>
            `, {
              headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              }
            });
          }
        }
      } catch (error) {
        console.error('Failed to proxy quiz content:', error);
        // Fallback to original embed code if proxying fails
      }
    }
    
    // If not a quiz-maker iframe or proxying failed, return the original embed code
    // but wrap it in our glassmorphism styling
    const cleanEmbedCode = decryptedEmbedCode
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<a[^>]*class="[^"]*back[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
      .replace(/<button[^>]*class="[^"]*back[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '');

    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Embedded Content</title>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            background: transparent !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .glassmorphism-embed-wrapper {
            position: relative;
            width: 100%;
            height: 100vh;
            border-radius: 20px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .embed-content-container {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 20px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          .glassmorphism-embed-wrapper:hover {
            transform: translateY(-2px);
          }
          .glassmorphism-embed-wrapper:hover .embed-content-container {
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            border-color: rgba(41, 173, 255, 0.2);
          }
          
          /* NUCLEAR CSS OVERRIDE - Force ALL backgrounds to be transparent */
          .glassmorphism-embed-wrapper *,
          .glassmorphism-embed-wrapper body,
          .glassmorphism-embed-wrapper html,
          .glassmorphism-embed-wrapper div,
          .glassmorphism-embed-wrapper form,
          .glassmorphism-embed-wrapper .quiz-container,
          .glassmorphism-embed-wrapper .question-container,
          .glassmorphism-embed-wrapper .quiz-content,
          .glassmorphism-embed-wrapper .question,
          .glassmorphism-embed-wrapper .answer,
          .glassmorphism-embed-wrapper .option,
          .glassmorphism-embed-wrapper .quiz,
          .glassmorphism-embed-wrapper .question,
          .glassmorphism-embed-wrapper .quiz-maker,
          .glassmorphism-embed-wrapper .content,
          .glassmorphism-embed-wrapper .main,
          .glassmorphism-embed-wrapper .container,
          .glassmorphism-embed-wrapper .wrapper,
          .glassmorphism-embed-wrapper .panel,
          .glassmorphism-embed-wrapper .card,
          .glassmorphism-embed-wrapper .box,
          .glassmorphism-embed-wrapper .section,
          .glassmorphism-embed-wrapper .area,
          .glassmorphism-embed-wrapper .region,
          .glassmorphism-embed-wrapper .block,
          .glassmorphism-embed-wrapper .element,
          .glassmorphism-embed-wrapper .component,
          .glassmorphism-embed-wrapper .widget,
          .glassmorphism-embed-wrapper .module,
          .glassmorphism-embed-wrapper .unit,
          .glassmorphism-embed-wrapper .part,
          .glassmorphism-embed-wrapper .segment,
          .glassmorphism-embed-wrapper .piece,
          .glassmorphism-embed-wrapper .chunk,
          .glassmorphism-embed-wrapper .fragment,
          .glassmorphism-embed-wrapper .portion {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
            background-attachment: scroll !important;
            background-clip: border-box !important;
            background-origin: padding-box !important;
            background-position: 0% 0% !important;
            background-repeat: repeat !important;
            background-size: auto !important;
          }
        </style>
      </head>
      <body>
        <div class="glassmorphism-embed-wrapper">
          <div class="embed-content-container">
            ${cleanEmbedCode}
          </div>
        </div>
      </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Error processing embed code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
