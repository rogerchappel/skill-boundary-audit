export function getHeadings(markdown) {
  const lines = getMarkdownLines(markdown);
  const headings = [];

  for (let index = 0; index < lines.length; index += 1) {
    const current = lines[index];
    if (current.inCode) continue;

    const atx = /^ {0,3}(#{1,6})\s+(.+?)\s*$/.exec(current.line);
    if (atx) {
      headings.push({
        depth: atx[1].length,
        title: atx[2].replace(/\s+#*$/, ""),
        line: current.number
      });
      continue;
    }

    const setext = /^ {0,3}(=+|-+)\s*$/.exec(current.line);
    const title = lines[index - 1];
    if (
      setext &&
      title &&
      !title.inCode &&
      /^ {0,3}\S/.test(title.line) &&
      !/^ {0,3}#{1,6}(?:\s|$)/.test(title.line)
    ) {
      headings.push({
        depth: setext[1][0] === "=" ? 1 : 2,
        title: title.line.trim(),
        line: title.number
      });
    }
  }

  return headings;
}

export function findLines(markdown, regex) {
  return getMarkdownLines(markdown)
    .filter(({ inCode }) => !inCode)
    .filter(({ line }) => regex.test(line));
}

export function getMarkdownLines(markdown) {
  let fence = null;

  return markdown.split(/\r?\n/).map((line, index) => {
    const marker = getFenceMarker(line);
    const wasInFence = fence !== null;

    if (!fence && marker) {
      fence = { character: marker[0], length: marker.length };
    } else if (
      fence &&
      marker?.[0] === fence.character &&
      marker.length >= fence.length &&
      new RegExp(`^ {0,3}\\${fence.character}{${fence.length},}\\s*$`).test(line)
    ) {
      fence = null;
    }

    return {
      line,
      number: index + 1,
      inFence: wasInFence || marker !== undefined,
      inCode: wasInFence || marker !== undefined || /^(?: {4}|\t)/.test(line)
    };
  });
}

function getFenceMarker(line) {
  const match = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
  if (!match) return undefined;

  const [marker, info] = match.slice(1);
  return marker[0] === "`" && info.includes("`") ? undefined : marker;
}

export function hasSection(headings, aliases) {
  return headings.some((heading) =>
    aliases.some((alias) => alias.test(heading.title.trim()))
  );
}
