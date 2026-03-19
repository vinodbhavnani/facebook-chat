import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import "highlight.js/styles/github-dark.css";

// Register only common languages to keep bundle small
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("sql", sql);

/** Highlighted code block component */
const CodeBlock = ({ className, children }: { className?: string; children: string }) => {
  const codeRef = useRef<HTMLElement>(null);
  const language = className?.replace("language-", "") || "";

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [children, language]);

  return (
    <pre className="bg-muted rounded-lg p-3 my-2 overflow-x-auto text-[13px] scrollbar-thin">
      <code ref={codeRef} className={language ? `language-${language}` : ""}>
        {children}
      </code>
    </pre>
  );
};

/** Parse @mentions within text nodes */
const processMentions = (text: string): React.ReactNode[] => {
  const regex = /@(\w+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} className="text-fb-mention font-semibold cursor-pointer hover:underline">
        @{match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
};

// Keep parseRichText export for backward compatibility with tests
export { parseRichText } from "./richTextParser";

interface RichTextRendererProps {
  content: string;
}

const RichTextRenderer = ({ content }: RichTextRendererProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Code blocks with syntax highlighting
        code({ node, className, children, ...props }) {
          const isBlock = className?.startsWith("language-") ||
            (typeof children === "string" && children.includes("\n"));
          
          if (isBlock) {
            return <CodeBlock className={className}>{String(children).replace(/\n$/, "")}</CodeBlock>;
          }

          return (
            <code className="bg-muted text-destructive px-1 py-0.5 rounded text-[13px] font-mono" {...props}>
              {children}
            </code>
          );
        },
        // Override paragraph to handle mentions
        p({ children }) {
          const processed = React.Children.map(children, (child) => {
            if (typeof child === "string") {
              return <>{processMentions(child)}</>;
            }
            return child;
          });
          return <p className="my-0">{processed}</p>;
        },
        // Styled elements
        strong({ children }) {
          return <strong className="font-bold">{children}</strong>;
        },
        em({ children }) {
          return <em className="italic">{children}</em>;
        },
        del({ children }) {
          return <s className="line-through text-muted-foreground">{children}</s>;
        },
        a({ href, children }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {children}
            </a>
          );
        },
        ul({ children }) {
          return <ul className="list-disc list-inside my-1 space-y-0.5 text-sm">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside my-1 space-y-0.5 text-sm">{children}</ol>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-3 border-primary/40 pl-3 my-1 text-muted-foreground italic">
              {children}
            </blockquote>
          );
        },
        h1({ children }) {
          return <h1 className="text-lg font-bold mt-2 mb-1">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-base font-bold mt-2 mb-1">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-sm font-bold mt-1 mb-0.5">{children}</h3>;
        },
        hr() {
          return <hr className="border-border my-2" />;
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full text-sm border border-border">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return <th className="border border-border bg-muted px-2 py-1 text-left font-semibold">{children}</th>;
        },
        td({ children }) {
          return <td className="border border-border px-2 py-1">{children}</td>;
        },
        img({ src, alt }) {
          return (
            <img
              src={src}
              alt={alt || ""}
              loading="lazy"
              className="max-h-60 rounded-lg object-cover my-1"
            />
          );
        },
        input({ checked, ...props }) {
          return (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-1.5 accent-primary"
              {...props}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default RichTextRenderer;
