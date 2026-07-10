export function getHeadings(markdown) {
  return markdown
    .split(/\r?\n/)
    .map((line, index) => {
      const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
      if (!match) return null;
      return {
        depth: match[1].length,
        title: match[2].replace(/\s+#*$/, ""),
        line: index + 1
      };
    })
    .filter(Boolean);
}

export function findLines(markdown, regex) {
  return markdown
    .split(/\r?\n/)
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => regex.test(line));
}

export function hasSection(headings, aliases) {
  return headings.some((heading) =>
    aliases.some((alias) => alias.test(heading.title.trim()))
  );
}
