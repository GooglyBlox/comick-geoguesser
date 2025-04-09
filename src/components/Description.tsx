import React from 'react';

interface DescriptionProps {
  content: string;
}

const Description: React.FC<DescriptionProps> = ({ content }) => {
  const markdownToHtml = (markdown: string): string => {
    let html = markdown;
    
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>');

    html = html.replace(/\((https?:\/\/[^)]+)\)/g, function(match, url) {
      if (url.includes('<a href') || match.includes('<a href')) {
        return match;
      }
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">' + url + '</a>';
    });
    
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold my-2">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold my-2">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold my-3">$1</h1>');
    
    html = html.replace(/(^|[^"])(https?:\/\/[^\s<)]+)([^">]|$)/g, function(match, before, url, after) {
      if (url.includes('<a href')) {
        return match;
      }
      return before + '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">' + url + '</a>' + after;
    });
    
    html = html.replace(/\n/g, '<br/>');
    
    return html;
  };

  return (
    <div 
      className="text-gray-300 text-sm"
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
    />
  );
};

export default Description;