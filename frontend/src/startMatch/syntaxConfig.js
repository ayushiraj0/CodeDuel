// syntaxConfig.js

export const COLORS = {
  keyword: '#d55fde', // Pink/Purple (e.g., import, const)
  function: '#61afef', // Blue (e.g., print, console.log)
  type: '#e5c07b',     // Yellow/Orange (e.g., int, bool)
  string: '#98c379',   // Green
  number: '#d19a66',   // Orange
  default: '#abb2bf'   // Gray/White
};

const commonKeywords = ['return', 'if', 'else', 'while', 'for', 'break', 'continue'];

export const LANGUAGE_RULES = {
  'C++': {
    keywords: [
      ...commonKeywords, 'using', 'namespace', 'std', 'include', 'define', 
      'class', 'struct', 'public', 'private', 'protected', 'virtual', 'friend',
      'template', 'typename', 'new', 'delete', 'this', 'true', 'false'
    ],
    types: ['int', 'float', 'double', 'char', 'void', 'bool', 'string', 'vector', 'auto', 'const'],
    functions: ['cout', 'cin', 'printf', 'scanf', 'main', 'push_back', 'size']
  },
  'Java': {
    keywords: [
      ...commonKeywords, 'public', 'private', 'protected', 'class', 'interface', 
      'extends', 'implements', 'new', 'this', 'super', 'import', 'package', 
      'static', 'final', 'try', 'catch', 'throw', 'throws', 'true', 'false', 'null'
    ],
    types: ['int', 'boolean', 'char', 'double', 'float', 'long', 'short', 'byte', 'String', 'void'],
    functions: ['System', 'out', 'println', 'main', 'length']
  },
  'JavaScript': {
    keywords: [
      ...commonKeywords, 'const', 'let', 'var', 'function', 'import', 'from', 
      'export', 'default', 'async', 'await', 'try', 'catch', 'class', 'extends',
      'new', 'this', 'typeof', 'instanceof', 'true', 'false', 'null', 'undefined'
    ],
    types: ['Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Promise'],
    functions: ['console', 'log', 'map', 'filter', 'reduce', 'push', 'split', 'join']
  },
  'Python': {
    keywords: [
      'def', 'class', 'if', 'elif', 'else', 'while', 'for', 'in', 'try', 'except', 
      'finally', 'with', 'as', 'import', 'from', 'return', 'pass', 'break', 
      'continue', 'lambda', 'global', 'nonlocal', 'True', 'False', 'None', 'is', 'not', 'and', 'or'
    ],
    types: ['int', 'float', 'str', 'bool', 'list', 'dict', 'set', 'tuple'],
    functions: ['print', 'len', 'range', 'input', 'open', 'type', 'id', 'str', 'int']
  }
};

/**
 * Helper to generate HTML with syntax highlighting
 */
export const highlightSyntax = (code, language) => {
  if (!code) return '';
  
  // Normalize language key (e.g., "Python Environment" -> "Python")
  const langKey = Object.keys(LANGUAGE_RULES).find(k => language.includes(k)) || 'JavaScript';
  const rules = LANGUAGE_RULES[langKey];
  
  // Escape HTML characters to prevent XSS and rendering issues
  let safeCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // 1. Strings (Simple regex for "..." or '...')
  // We handle strings first so keywords inside strings aren't highlighted
  // Note: This is a basic regex, might not handle escaped quotes perfectly
  safeCode = safeCode.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, match => {
      return `<span style="color: ${COLORS.string}">${match}</span>`;
  });

  // 2. Numbers
  safeCode = safeCode.replace(/\b\d+\b/g, match => {
      // Avoid highlighting numbers inside spans we just created
      if(match.startsWith('<') || match.endsWith('>')) return match; 
      return `<span style="color: ${COLORS.number}">${match}</span>`;
  });

  // Helper for word replacement
  const replaceWords = (text, wordList, color) => {
      const regex = new RegExp(`\\b(${wordList.join('|')})\\b`, 'g');
      return text.replace(regex, `<span style="color: ${color}">$1</span>`);
  };

  // 3. Keywords, Types, Functions
  // We split by span tags to only highlight text that isn't already styled (like strings)
  const segments = safeCode.split(/(<span.*?>.*?<\/span>)/g);
  
  const highlightedSegments = segments.map(segment => {
      if (segment.startsWith('<span')) return segment; // Don't touch already colored segments
      
      let processed = segment;
      processed = replaceWords(processed, rules.keywords, COLORS.keyword);
      processed = replaceWords(processed, rules.types, COLORS.type);
      processed = replaceWords(processed, rules.functions, COLORS.function);
      return processed;
  });

  return highlightedSegments.join('');
};