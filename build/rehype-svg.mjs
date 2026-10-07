function visit(node) {
  if (node.properties) {
    for (const [camel, attribute] of [
      ["strokeWidth", "stroke-width"],
      ["strokeLinecap", "stroke-linecap"],
      ["strokeLinejoin", "stroke-linejoin"],
      ["strokeLineCap", "stroke-linecap"],
      ["strokeLineJoin", "stroke-linejoin"],
    ]) {
      if (camel in node.properties) {
        node.properties[attribute] = node.properties[camel];
        delete node.properties[camel];
      }
    }
  }
  for (const child of node.children ?? []) visit(child);
}

export default function normalizeSvgAttributes() {
  return visit;
}
