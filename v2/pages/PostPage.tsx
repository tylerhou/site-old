import type { PropsWithChildren } from "react";

import BasePage from "./BasePage.tsx";

import solarizedcss from "./solarized-css.ts";

export interface PostPageFrontmatter {
  title: string;
  subtitle: string;
  date: string;
  code: boolean;
  math: boolean;
  unlisted: boolean;
}

export interface PostPageProps {
  frontmatter: PostPageFrontmatter;
}

function PostPage({ children, frontmatter }: PropsWithChildren<PostPageProps>) {
  let codeNode = null;
  if (frontmatter.code) {
    codeNode = (
      <>
        <style dangerouslySetInnerHTML={{ __html: solarizedcss }} />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </>
    );
  }

  let mathNode = null;
  if (frontmatter.math) {
    mathNode = (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              MathJax = {
                tex: {
                  inlineMath: [['$', '$'], ["\\(","\\)"]],
                  processEscapes: true,
                }
              };`,
          }}
        />
        <script src="https://polyfill.io/v3/polyfill.min.js?features=es6" />
        <script
          id="MathJax-script"
          async
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        />
      </>
    );
  }

  return (
    <BasePage title={frontmatter.title}>
      <div className="content">
        <article className="post">
          <time className="posted-at">02 Jan 2021</time>
          <h1 className="title">Style Test</h1>
          <section className="subtitle">Subtitle subtitle subtitle.</section>
          <noscript>
            <p className="italic">
              Some content (math) may not display properly with JavaScript
              blocked.
            </p>
          </noscript>
          <main>{children}</main>
        </article>
      </div>
      {codeNode}
      {mathNode}
    </BasePage>
  );
}

export default PostPage;
