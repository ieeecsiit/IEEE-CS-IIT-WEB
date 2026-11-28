import { Fragment, type ReactNode } from "react";

const URL_PATTERN = /(https?:\/\/[^\s)]+)/g;

function linkify(text: string): ReactNode[] {
  return text.split(URL_PATTERN).map((part, index) =>
    index % 2 === 1 ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="break-all text-ember underline underline-offset-4">
        {part}
      </a>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

/**
 * Renders admin-written plain text: blank lines split paragraphs, "- " or "* " lines become
 * bullets, and URLs become links. Never interprets HTML.
 */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.replace(/\r\n/g, "\n").trim().split(/\n\s*\n/);
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {blocks.map((block, index) => {
        const lines = block.split("\n");
        if (lines.every((line) => /^\s*[-*•]\s+/.test(line))) {
          return (
            <ul key={index} className="m-0 flex list-disc flex-col gap-1.5 pl-6 marker:text-brand">
              {lines.map((line, i) => (
                <li key={i}>{linkify(line.replace(/^\s*[-*•]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="m-0 leading-relaxed whitespace-pre-line">
            {linkify(block)}
          </p>
        );
      })}
    </div>
  );
}
