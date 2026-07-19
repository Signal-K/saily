import type { ReactNode } from "react";
import type { MarkdownBlock, MarkdownInline } from "@/lib/markdown";
import { PuzzleWidget } from "@/components/puzzle-widget";

function renderInline(nodes: MarkdownInline[]): ReactNode {
  return nodes.map((node, index) => {
    switch (node.type) {
      case "text":
        return node.text;
      case "strong":
        return <strong key={index}>{renderInline(node.children)}</strong>;
      case "emphasis":
        return <em key={index}>{renderInline(node.children)}</em>;
      case "code":
        return <code key={index}>{node.text}</code>;
      case "link":
        return (
          <a key={index} href={node.href} target={node.href.startsWith("http") ? "_blank" : undefined} rel={node.href.startsWith("http") ? "noreferrer" : undefined}>
            {renderInline(node.children)}
          </a>
        );
      case "image":
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={index} src={node.src} alt={node.alt} style={{ maxWidth: "100%", borderRadius: "8px" }} />
        );
    }
  });
}

export function MarkdownContent({ blocks }: { blocks: MarkdownBlock[] }) {
  return (
    <div className="cms-article-body">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            if (block.level === 1) {
              return <h2 key={index}>{renderInline(block.children)}</h2>;
            }
            if (block.level === 2) {
              return <h2 key={index}>{renderInline(block.children)}</h2>;
            }
            return <h3 key={index}>{renderInline(block.children)}</h3>;
          case "paragraph":
            return <p key={index}>{renderInline(block.children)}</p>;
          case "blockquote":
            return <blockquote key={index}>{renderInline(block.children)}</blockquote>;
          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderInline(item)}</li>
                ))}
              </ListTag>
            );
          }
          case "code":
            return (
              <pre key={index}>
                <code>{block.code}</code>
              </pre>
            );
          case "puzzle-widget":
            return <PuzzleWidget key={index} />;
        }
      })}
    </div>
  );
}
