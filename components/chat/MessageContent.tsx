import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageContentProps {
  content: string;
}

export default function MessageContent({ content }: MessageContentProps) {
  // Regular expression to match fenced code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  // Split content into parts (text and code blocks)
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }

    // Add the code block
    parts.push({
      type: 'code',
      content: match[2].trim(),
      language: match[1] || 'text'
    });

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text after the last code block
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  // If no code blocks found, return the original content
  if (parts.length === 0) {
    return <>{content}</>;
  }

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          // Render text content, preserving line breaks
          return (
            <span key={index} style={{ whiteSpace: 'pre-wrap' }}>
              {part.content}
            </span>
          );
        } else {
          // Render code block with syntax highlighting
          return (
            <div key={index} className="my-3 rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language={part.language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                }}
                showLineNumbers={true}
              >
                {part.content}
              </SyntaxHighlighter>
            </div>
          );
        }
      })}
    </>
  );
}
