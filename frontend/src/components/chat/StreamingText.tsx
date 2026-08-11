import ReactMarkdown from "react-markdown";
import clsx from "clsx";
import { remarkPlugins, rehypePlugins } from "../../utils/markdown";
import { CodeBlock } from "./CodeBlock";

interface StreamingTextProps {
  content: string;
  streaming?: boolean;
}

export function StreamingText({ content, streaming }: StreamingTextProps) {
  return (
    <div className="relative">
      <div
        className={clsx(
          "prose prose-invert prose-sm max-w-none",
          "[&_p]:text-ink-primary [&_p]:leading-relaxed [&_p]:my-2",
          "[&_h1]:text-ink-primary [&_h2]:text-ink-primary [&_h3]:text-ink-primary",
          "[&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm",
          "[&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-medium",
          "[&_ul]:text-ink-primary [&_ol]:text-ink-primary [&_li]:my-0.5",
          "[&_strong]:text-ink-primary [&_strong]:font-semibold",
          "[&_a]:text-accent-glow [&_a]:no-underline hover:[&_a]:underline",
          "[&_blockquote]:border-l-accent [&_blockquote]:text-ink-secondary",
          "[&_:not(pre)>code]:bg-surface-overlay [&_:not(pre)>code]:text-accent-glow",
          "[&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded",
          "[&_:not(pre)>code]:text-xs [&_:not(pre)>code]:font-mono",
          "[&_:not(pre)>code]:border [&_:not(pre)>code]:border-surface-border",
          "[&_pre]:p-0 [&_pre]:bg-transparent [&_pre]:m-0"
        )}
      >
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={{
            code({ className, children, ...props }) {
              const isBlock = /language-/.test(className ?? "");
              if (isBlock) {
                return (
                  <CodeBlock className={className}>
                    {String(children).replace(/\n$/, "")}
                  </CodeBlock>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      {streaming && (
        <span className="inline-block w-[2px] h-4 bg-accent ml-0.5 animate-blink align-middle" />
      )}
    </div>
  );
}