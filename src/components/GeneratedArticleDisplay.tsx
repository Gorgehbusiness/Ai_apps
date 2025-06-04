import React, { useState, useCallback } from 'react';

interface GeneratedArticleDisplayProps {
  article: string;
  keyword?: string;
}

// Helper function to sanitize line by removing markdown asterisks and then any remaining standalone asterisks
const sanitizeLineCompletely = (line: string): string => {
  // First, remove markdown bold/italic e.g., **text** or *text* becomes text
  let sanitized = line.replace(/\*\*(?=\S)(.+?)(?<=\S)\*\*|\*(?=\S)(.+?)(?<=\S)\*/g, (match, p1, p2) => p1 || p2 || '');
  // Then, remove any remaining standalone asterisks
  sanitized = sanitized.replace(/\*/g, '');
  return sanitized;
};

// Helper function to create styled HTML for clipboard
const generateStyledHtmlForCopy = (articleText: string, baseKeyword?: string): string => {
  const lines = articleText.split('\n');
  let htmlOutput = "";

  const keywordToMatch = baseKeyword?.trim();
  const escapedKeywordForRegex = keywordToMatch ? keywordToMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null;
  const keywordRegex = escapedKeywordForRegex ? new RegExp(`(\\b${escapedKeywordForRegex}\\b)`, 'gi') : null;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    let fullySanitizedLine = sanitizeLineCompletely(trimmedLine); 

    const headingMatch = fullySanitizedLine.match(/^(#{1,3})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].replace(/#/g, ''); // Remove any # from heading text itself
      const tagName = `h${level + 2}`; 
      htmlOutput += `<${tagName} style="color: #8b5cf6; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em;">${text}</${tagName}>\n`;
    } else {
      // For paragraphs, remove ALL '#' characters from the line.
      const lineForParagraph = fullySanitizedLine.replace(/#/g, '');
      let styledLine = lineForParagraph;
      if (keywordRegex && keywordToMatch && lineForParagraph) { // Ensure lineForParagraph is not empty
        styledLine = lineForParagraph.replace(keywordRegex, 
          (match) => `<span style="color: #2563eb; font-weight: 600; font-size: 1.05em;">${match}</span>`
        );
      }
      if (styledLine.trim()) { // Only add non-empty paragraphs
        htmlOutput += `<p style="line-height: 1.6; margin-bottom: 0.75em;">${styledLine}</p>\n`;
      }
    }
  });
  return htmlOutput;
};


const processLineForStyling = (textLine: string, lineIndex: number, baseKeyword?: string): (string | JSX.Element)[] => {
  // console.log(`[Keyword Match Debug][Line ${lineIndex}] START Processing line. Raw Keyword: '${baseKeyword}', Line snippet: "${textLine.substring(0, 70)}..."`);

  if (!baseKeyword || baseKeyword.trim() === "") {
    // console.log(`[Keyword Match Debug][Line ${lineIndex}] No keyword provided or keyword is empty after trim. Returning original line.`);
    return [textLine]; 
  }

  const keywordToMatch = baseKeyword.trim();
  // console.log(`[Keyword Match Debug][Line ${lineIndex}] Effective keyword for matching: '${keywordToMatch}' (Length: ${keywordToMatch.length})`);

  const elements: (string | JSX.Element)[] = [];
  // Escape special characters in keyword for regex
  const escapedKeyword = keywordToMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Create a regex to find the keyword as a whole word, case-insensitive, globally
  const regex = new RegExp(`(\\b${escapedKeyword}\\b)`, 'gi'); 
  
  // console.log(`[Keyword Match Debug][Line ${lineIndex}] Using regex: ${regex} on line: "${textLine}"`);

  let lastIndex = 0;
  let match;
  let partKey = 0;
  let matchFoundInLine = false;

  while ((match = regex.exec(textLine)) !== null) {
    matchFoundInLine = true;
    // console.log(`[Keyword Match Debug][Line ${lineIndex}] Match found! Matched text: '${match[0]}', Index: ${match.index}, LastIndex: ${regex.lastIndex}`);
    
    // Add text part before the match
    if (match.index > lastIndex) {
      elements.push(textLine.substring(lastIndex, match.index));
    }
    // Add the styled keyword
    elements.push(
      <span
        key={`keyword-${lineIndex}-${partKey++}`}
        className="font-semibold text-blue-600 text-[1.05em] mx-px" // Style for blue, bold, slightly larger keyword
      >
        {match[0]} 
      </span>
    );
    lastIndex = regex.lastIndex;
    if (lastIndex === match.index) { // Avoid infinite loops with zero-length matches (though \b should prevent this for non-empty keywords)
        regex.lastIndex++;
    }
  }

  // Add the remaining part of the text line after the last match
  if (lastIndex < textLine.length) {
    elements.push(textLine.substring(lastIndex));
  }
  
  if (!matchFoundInLine) {
    // console.log(`[Keyword Match Debug][Line ${lineIndex}] No WHOLE WORD match for '${keywordToMatch}' in this line using regex. Line: "${textLine}"`);
  }

  // console.log(`[Keyword Match Debug][Line ${lineIndex}] END Processing. Elements count: ${elements.length}`);
  return elements.length > 0 ? elements : [textLine]; 
};


export const GeneratedArticleDisplay: React.FC<GeneratedArticleDisplayProps> = ({ article, keyword }) => {
  const [isCopied, setIsCopied] = useState(false);
  console.log("[GeneratedArticleDisplay.tsx] Received keyword prop for display styling:", keyword);

  const lines = article.split('\n').filter(line => line.trim() !== '');

  const handleCopyArticle = useCallback(async () => {
    const plainText = article.split('\n').map(line => {
        const sanitized = sanitizeLineCompletely(line.trim());
        if (sanitized.match(/^(#{1,3})\s+(.*)/)) { // If it's a heading
            return sanitized.replace(/^(#{1,3})\s+/, '').replace(/#/g, ''); // Keep heading text, remove all #
        }
        return sanitized.replace(/#/g, ''); // For paragraphs, remove all #
    }).filter(Boolean).join('\n');

    const htmlText = generateStyledHtmlForCopy(article, keyword);

    try {
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
        'text/html': new Blob([htmlText], { type: 'text/html' }),
      });
      await navigator.clipboard.write([clipboardItem]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500); 
    } catch (err) {
      console.error('Failed to copy article with rich text: ', err);
      try {
        await navigator.clipboard.writeText(plainText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
        alert('مقاله با موفقیت کپی شد (فقط متن ساده). مرورگر شما ممکن است از کپی با استایل پشتیبانی نکند.');
      } catch (fallbackErr) {
        console.error('Failed to copy article as plain text (fallback): ', fallbackErr);
        alert('خطا در کپی کردن مقاله. لطفا از طریق کنسول مرورگر مشکل را بررسی کنید.');
      }
    }
  }, [article, keyword]);

  const renderLine = (line: string, index: number) => {
    let fullySanitizedLine = sanitizeLineCompletely(line.trim()); 

    const headingMatch = fullySanitizedLine.match(/^(#{1,3})\s+(.*)/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      // Remove any '#' characters from the heading text itself for display
      const text = headingMatch[2].replace(/#/g, ''); 
      const Tag = `h${level + 2}` as keyof JSX.IntrinsicElements; 
      
      const universalGradientColorClass = 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500';
      
      let textSizeClass = '';
      let margins = 'mt-4 mb-2'; 

      if (level === 1) { 
        textSizeClass = 'text-3xl'; 
        margins = 'mt-6 mb-3';
      } else if (level === 2) { 
        textSizeClass = 'text-2xl'; 
        margins = 'mt-5 mb-2';
      } else { 
        textSizeClass = 'text-xl'; 
      }

      return (
        <Tag 
          key={`heading-${index}`} 
          className={`font-semibold ${margins} ${universalGradientColorClass} ${textSizeClass}`}
        >
          {text}
        </Tag>
      );
    }

    // For paragraphs, remove ALL '#' characters from the line before styling for keywords
    const paragraphText = fullySanitizedLine.replace(/#/g, '');
    
    if (!paragraphText.trim()) { // If line becomes empty after removing #, don't render it
        return null;
    }

    return (
      <p key={`paragraph-${index}`} className="leading-relaxed text-justify mb-3 text-slate-200">
        {processLineForStyling(paragraphText, index, keyword)}
      </p>
    );
  };

  return (
    <div className="mt-8 p-6 bg-slate-700 rounded-lg shadow-inner">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          مقاله تولید شده:
        </h2>
        <button
          onClick={handleCopyArticle}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ease-in-out
            ${isCopied 
              ? 'bg-green-500 text-white cursor-default' 
              : 'bg-purple-600 hover:bg-purple-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-700'
            }`}
          aria-live="polite"
          disabled={isCopied}
        >
          {isCopied ? 'کپی شد!' : 'کپی کردن مقاله'}
        </button>
      </div>
      <div className="max-w-none prose prose-invert prose-sm sm:prose-base text-slate-200"> 
        {lines.map(renderLine).filter(Boolean)} {/* Filter out nulls from empty lines */}
      </div>
    </div>
  );
};
