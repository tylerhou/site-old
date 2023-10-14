import fs from "fs";
import path from "path";

import Markdoc, { nodes, Tag } from "@markdoc/markdoc";
import React from "react";
import ReactDOM from "react-dom/server";
import { JSDOM } from "jsdom";
import { minify } from "@swc/html";
import { glob } from "glob";

// To get this to work, have to delete
// && typeof process.browser === "undefined";
// from pyodide sources.
import { loadPyodide } from "pyodide";

import PostPage, { PostPageFrontmatter } from "./pages/PostPage.tsx";

import Test from "./components/Test.tsx";

const paths = await glob("posts/*.md");

const components = {
  Test: Test,
};

const pyodide = await loadPyodide({
  indexURL: "pyodide-0.24.1",
  packages: ["pygments"],
});

function highlight(lang: string, code: string) {
  (pyodide.globals as any).set("lang", lang);
  (pyodide.globals as any).set("code", code);
  const python = `from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter

lexer = get_lexer_by_name(lang, stripall=True)
formatter = HtmlFormatter(style="solarized-light", linenos=True)
highlight(code, lexer, formatter)
`;
  const output = pyodide.runPython(python);
  return output;
}

const customNodes = {
  // https://github.com/markdoc/docs/blob/main/markdoc/nodes/document.markdoc.js
  document: {
    ...nodes.document,
    render: function Document({ children }: React.PropsWithChildren) {
      return children;
    },
    transform(node: any, config: any) {
      return new Tag(
        this.render as any,
        { source: config.source },
        node.transformChildren(config)
      );
    },
  },
  fence: {
    ...nodes.fence,
    render: function Fence(props: any) {
      const language = props["data-language"];
      return (
        <code
          dangerouslySetInnerHTML={{
            __html: highlight(language, props.content),
          }}
        ></code>
      );
    },
    transform(node: any, config: any) {
      console.log(node, config);
      const attributes = {
        ...node.transformAttributes(config),
        ...node.attributes,
      };

      return new Tag(this.render as any, attributes, []);
    },
  },
};

const tags = Object.fromEntries(
  Object.keys(components).map((name) => {
    return [
      name,
      {
        render: name,
        attributes: {},
      },
    ];
  })
);

class ScriptAndStyleMover {
  scripts: HTMLScriptElement[];
  styles: HTMLStyleElement[];
  links: HTMLLinkElement[];
  title: HTMLTitleElement | undefined;

  constructor({
    scripts,
    styles,
    links,
    title,
  }: {
    scripts: HTMLScriptElement[];
    styles: HTMLStyleElement[];
    links: HTMLLinkElement[];
    title: HTMLTitleElement | undefined;
  }) {
    this.scripts = scripts;
    this.styles = styles;
    this.links = links;
    this.title = title;
  }

  element(element: any) {
    if (element.tagName == "script") {
      element.remove();
    } else if (element.tagName == "style") {
      element.remove();
    } else if (element.tagName == "link") {
      element.remove();
    } else if (element.tagName == "title") {
      element.remove();
    } else if (element.tagName == "head") {
      if (this.title != null) {
        element.append(this.title.outerHTML, { html: true });
      }

      for (const style of this.styles) {
        element.append(style.outerHTML, { html: true });
      }
      for (const link of this.links) {
        element.append(link.outerHTML, { html: true });
      }
    } else if (element.tagName == "body") {
      for (const script of this.scripts) {
        element.append(script.outerHTML, { html: true });
      }
    }
  }
}

async function moveScriptsAndStyles(html: string) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const scripts = Array.from(doc.getElementsByTagName("script"));
  const styles = Array.from(doc.getElementsByTagName("style"));
  const links = Array.from(doc.getElementsByTagName("link"));
  const title = Array.from(doc.getElementsByTagName("title"))[0];

  const mover = new ScriptAndStyleMover({ scripts, styles, links, title });
  return await new HTMLRewriter()
    .on("*", mover)
    .transform(new Response(html))
    .text();
}

for (const p of paths) {
  const ast = Markdoc.parse(await Bun.file(p).text());
  const content = Markdoc.transform(ast, { tags, nodes: customNodes as any });

  const frontmatter = JSON.parse(
    ast.attributes["frontmatter"]
  ) as PostPageFrontmatter;

  const node = Markdoc.renderers.react(content, React, {
    components,
  }) as React.ReactElement;

  const inner = ReactDOM.renderToString(
    <PostPage frontmatter={frontmatter}>{node}</PostPage>
  );

  let html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script></script>
  </head>
  <body>
    ${inner}
  </body>
</html>
`;

  html = await moveScriptsAndStyles(html);
  html = (await minify(Buffer.from(html))).code;

  const parsedPath = path.parse(p);
  const destPath = path.join(
    "public",
    parsedPath.dir,
    `${parsedPath.base}.html`
  );

  const parsedDestPath = path.parse(destPath);
  await fs.promises.mkdir(parsedDestPath.dir, { recursive: true });

  await Bun.write(Bun.file(destPath), html);
}
