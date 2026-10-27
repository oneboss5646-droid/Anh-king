import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse markdown blocks: code blocks, tables, lists, quotes, paragraphs
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="prose-content space-y-3 leading-relaxed text-[15px] sm:text-base break-words">
      {blocks.map((block, idx) => (
        <React.Fragment key={idx}>{renderBlock(block, idx)}</React.Fragment>
      ))}
    </div>
  );
};

interface Block {
  type: 'code' | 'table' | 'quote' | 'heading' | 'list' | 'hr' | 'paragraph';
  raw: string;
  lang?: string;
  level?: number;
  items?: string[];
  ordered?: boolean;
  rows?: string[][];
  headers?: string[];
}

function parseMarkdownBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block ```
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || 'code';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: 'code',
        raw: codeLines.join('\n'),
        lang,
      });
      i++;
      continue;
    }

    // Horizontal rule --- or ***
    if (/^(\s*[-*_]\s*){3,}$/.test(line.trim())) {
      blocks.push({ type: 'hr', raw: line });
      i++;
      continue;
    }

    // Headings # ## ### ####
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        raw: headingMatch[2],
      });
      i++;
      continue;
    }

    // Blockquote >
    if (line.trim().startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'quote',
        raw: quoteLines.join('\n'),
      });
      continue;
    }

    // Table detection: line with | and next line with |-
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].includes('-')) {
      const headers = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1 || arr.length <= 2);
      i += 2; // skip header and separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().length > 0) {
        const rowCells = lines[i].split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1 || arr.length <= 2);
        rows.push(rowCells);
        i++;
      }
      blocks.push({
        type: 'table',
        raw: '',
        headers,
        rows,
      });
      continue;
    }

    // Lists (bullet or numbered)
    const listBulletMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
    if (listBulletMatch) {
      const items: string[] = [];
      const ordered = /\d+\./.test(listBulletMatch[2]);
      while (i < lines.length) {
        const itemMatch = lines[i].match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
        if (!itemMatch) break;
        items.push(itemMatch[3]);
        i++;
      }
      blocks.push({
        type: 'list',
        raw: '',
        items,
        ordered,
      });
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Standard paragraph (accumulate contiguous lines)
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].match(/^#{1,4}\s+/) &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].match(/^(\s*)([-*+]|\d+\.)\s+/) &&
      !/^(\s*[-*_]\s*){3,}$/.test(lines[i].trim())
    ) {
      pLines.push(lines[i]);
      i++;
    }
    blocks.push({
      type: 'paragraph',
      raw: pLines.join(' '),
    });
  }

  return blocks;
}

function renderBlock(block: Block, key: number) {
  switch (block.type) {
    case 'code':
      return <CodeBlock code={block.raw} lang={block.lang || 'text'} key={key} />;

    case 'heading': {
      const content = renderInline(block.raw);
      if (block.level === 1) return <h1 key={key} className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mt-4 mb-2">{content}</h1>;
      if (block.level === 2) return <h2 key={key} className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-3 mb-2">{content}</h2>;
      if (block.level === 3) return <h3 key={key} className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-200 mt-2 mb-1">{content}</h3>;
      return <h4 key={key} className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-300 mt-2 mb-1">{content}</h4>;
    }

    case 'quote':
      return (
        <blockquote key={key} className="pl-4 py-1 border-l-2 border-slate-300 dark:border-slate-700 italic text-slate-600 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/30 rounded-r-lg">
          {renderInline(block.raw)}
        </blockquote>
      );

    case 'table':
      return (
        <div key={key} className="overflow-x-auto my-3 border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {block.headers && block.headers.length > 0 && (
              <thead className="bg-slate-100 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                <tr>
                  {block.headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
              {block.rows?.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-900/30'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 whitespace-normal">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'list': {
      if (block.ordered) {
        return (
          <ol key={key} className="list-decimal pl-5 space-y-1 text-slate-800 dark:text-slate-200">
            {block.items?.map((item, iIdx) => (
              <li key={iIdx}>{renderInline(item)}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul key={key} className="list-disc pl-5 space-y-1 text-slate-800 dark:text-slate-200">
          {block.items?.map((item, iIdx) => (
            <li key={iIdx}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    }

    case 'hr':
      return <hr key={key} className="my-4 border-slate-200 dark:border-slate-800" />;

    case 'paragraph':
    default:
      return (
        <p key={key} className="text-slate-800 dark:text-slate-200">
          {renderInline(block.raw)}
        </p>
      );
  }
}

const CodeBlock: React.FC<{ code: string; lang: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 text-slate-100 text-xs sm:text-sm font-mono shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-slate-400">
        <span className="text-[11px] font-medium tracking-wide lowercase">{lang}</span>
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-[13px] leading-relaxed">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

/**
 * Handles inline markdown: bold, italic, inline code, links
 */
function renderInline(text: string): React.ReactNode[] {
  // Regex splitting on code, bold, italic, links
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${match.index}-${token.slice(0, 5)}`;

    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={key} className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-emerald-300 font-mono text-[13px]">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={key} className="font-semibold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={key} className="italic text-slate-800 dark:text-slate-200">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const textMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (textMatch) {
        parts.push(
          <a
            key={key}
            href={textMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-500"
          >
            {textMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
