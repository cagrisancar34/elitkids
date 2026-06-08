type RichNode = {
  children?: RichNode[];
  tag?: string;
  text?: string;
  type?: string;
};

function textFromNode(node: RichNode): string {
  if (typeof node.text === "string") return node.text;
  return (node.children ?? []).map(textFromNode).join("");
}

export function SimpleRichText({
  data,
  className = "",
}: {
  data: unknown;
  className?: string;
}) {
  const root =
    typeof data === "object" && data && "root" in data
      ? (data.root as RichNode)
      : undefined;

  return (
    <div className={className}>
      {(root?.children ?? []).map((node, index) => {
        const text = textFromNode(node);
        if (!text) return null;
        if (node.type === "heading" || node.tag === "h2" || node.tag === "h3") {
          return (
            <h2 key={index} className="mb-4 mt-8 text-2xl font-semibold text-stone-950">
              {text}
            </h2>
          );
        }
        return (
          <p key={index} className="mb-5 leading-8 text-stone-700">
            {text}
          </p>
        );
      })}
    </div>
  );
}
