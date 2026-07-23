const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

export default function remarkMermaid() {
  return (tree) => {
    const visit = (node) => {
      if (!node.children) return;

      node.children = node.children.map((child) => {
        if (child.type === 'code' && child.lang === 'mermaid') {
          return {
            type: 'html',
            value: `<pre class="mermaid">${escapeHtml(child.value)}</pre>`,
          };
        }

        visit(child);
        return child;
      });
    };

    visit(tree);
  };
}
