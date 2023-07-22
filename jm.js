#!/usr/bin/env node

import TurndownService from "turndown";
import fs from "fs/promises";
import { gfm, strikethrough, tables } from "turndown-plugin-gfm";

const isBlank = (str) => (!str || /^\s*$/.test(str));
var turndownService = new TurndownService();
turndownService.use([gfm, strikethrough, tables]);

turndownService.addRule("keepIds", {
  filter: (node) => node.nodeType === 1 && node.hasAttribute("id"),
  replacement: (content, node) => {
    if (isBlank(content)) {
      return content;
    }
    const id = node.getAttribute("id");
    return id ? `${content} {#${id}}\n` : content;
  },
});

const htmlToMarkdown = (html) => {
  var markdown = turndownService.turndown(html);
  return markdown;
};

const createContent = (title, content) => {
  let filename = `./web/h2w/_content/${title}.md`;
  let data = `---\ntitle: ${title}\n---\n ${content}`;
  fs.writeFile(filename, data);
};

const stash = await fs.readFile("./stash.json", {
  encoding: "utf8",
}).then((res) => JSON.parse(res));

for (let a of stash["a"]) {
  let title = a["title"];
  let content = a["content"];
  title = title.replace(/[ \/]/gm, "_");
  title = title.replace(/'/gm, "");
  content = content.replace(/\n/gm, " ");
  content = content.replace(
    /<th.*?th>/gm,
    (match) => {
      match = match.replace(/\s*<br.*?\/>\s*/g, "");
      return match;
    },
  );
  // content = content.replace(/href=".*?php.*?"/gm, "");
  content = content.replace(/href="\/(.*?)"/gm, 'href="/wiki/$1"');
  content = content.replace(/ +/gm, " ");
  let md = htmlToMarkdown(content);
  createContent(title, md);
}
