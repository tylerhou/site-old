import * as sass from "sass";

const scss = `
$break-small: 700px;
$break-medium: 900px;
$break-large: 1200px;
$break-huge: 1800px;
$base03: rgb(0, 43, 54);
$base02: rgb(7, 54, 66);
$base01: rgb(88, 110, 117);
$base00: rgb(101, 123, 131);
$base0: rgb(131, 148, 150);
$base1: rgb(147, 161, 161);
$base2: rgb(238, 232, 213);
$base3: rgb(253, 246, 227);
$yellow: rgb(181, 137, 0);
$orange: rgb(203, 75, 22);
$red: rgb(220, 50, 47);
$magenta: rgb(211, 54, 130);
$violet: rgb(108, 113, 196);
$blue: rgb(38, 139, 210);
$cyan: rgb(42, 161, 152);
$green: rgb(133, 153, 0);

/* Resets */
*,
*:before,
*:after {
  box-sizing: border-box;
}

pre {
  margin: 0;
}

html,
body {
  margin: 0;
  padding: 0;
}

// Push footer to bottom.
body {
  min-height: 100vh;
}

p {
  margin-bottom: 1rem;
}

::selection {
  background-color: scale-color($blue, $alpha: -75%);
}

// From https://type-scale.com/
:not(h1):not(h2):not(h3):not(h4):not(h5) + h1,
:not(h1):not(h2):not(h3):not(h4):not(h5) + h2,
:not(h1):not(h2):not(h3):not(h4):not(h5) + h3,
:not(h1):not(h2):not(h3):not(h4):not(h5) + h4,
:not(h1):not(h2):not(h3):not(h4):not(h5) + h5 {
  margin-block-start: 3rem;
}

// Spacing between headers.
h1,
h2,
h3,
h4,
h5 {
  margin-block-start: 0.8rem;
  margin-block-end: 0.38rem;
  line-height: 1.18em;
}

h1 + :not(h1):not(h2):not(h3):not(h4):not(h5),
h2 + :not(h1):not(h2):not(h3):not(h4):not(h5),
h3 + :not(h1):not(h2):not(h3):not(h4):not(h5),
h4 + :not(h1):not(h2):not(h3):not(h4):not(h5),
h5 + :not(h1):not(h2):not(h3):not(h4):not(h5) {
  margin-block-start: 1rem;
}

h1,
h2 {
  font-weight: 600;
}

h3,
h5 {
  font-style: italic;
  font-weight: 400;
}

h4 {
  font-weight: 600;
}

a.anchor:any-link {
  position: absolute;
  color: scale-color($base1, $lightness: +50%);
  margin-left: -28px;
  font-style: italic;
  text-decoration: none;
  font-weight: 400;
}

a.anchor:active {
  background-color: rbga(0, 0, 0, 0);
}

// type-scale.com
$scale: 1.125;
$h1: 2rem;
$h2: $h1 / scale;
$h3: $h2 / scale;
$h4: $h3 / scale;
$h5: $h4 / scale;
h1 {
  font-size: $h1;
}
h2 {
  font-size: $h2;
}
h3 {
  font-size: $h3;
}
h4 {
  font-size: $h4;
}
h5 {
  font-size: $h5;
}

small,
.text_small {
  font-size: 0.889rem;
}

body {
  // Center in page.
  display: flex;
  flex-direction: column;

  padding: 1em;
  font-size: 20px;
  font-family: "adobe-garamond-pro", serif;
  color: scale-color($base03, $lightness: -50%);
  background-color: scale-color($base3, $lightness: +80%);
  text-decoration-thickness: from-font;
}

a:link {
  color: scale-color(scale-color($blue, $lightness: -40%), $blue: +100%);
}

a:visited {
  color: scale-color($violet, $lightness: -40%);
}

strong {
  font-weight: 600;
}

code {
  display: block;
}

// Inline code.
code pre {
  margin-inline-start: 0;
  margin-inline-end: 0;
  font-family: "Inconsolata", monospace;
  font-weight: 400;
}

em + code {
    // TODO(tylerhou): Make this not apply when text nodes are between.
    margin-inline-start: 0.25em;
}

.highlight {
  overflow-x: auto;
  line-height: 1em;
  background-color: #eee8d5;
  font-size: 0.765em;

  .code {
    margin-inline-start: 0;
    margin-inline-end: 0;

    // Safari on iOS increases text side for code blocks if they are too wide.
    -webkit-text-size-adjust: 100%;
    text-size-adjust: none;

    @media screen and (min-width: $break-small) {
      line-height: 1em;
    }

    padding: 0.6em 0.2em;
    overflow-x: auto; // Color should overflow.
    padding-left: calc(0.2em + 4px);

    > table.highlighttable {
        margin-left: -26px;
    }
  }
}

// Fix one-line codeblock on Firefox.
.highlight .linenos .normal:only-child {
  display: inline-block;
}

.content {
  flex: 1;
  line-height: 1.3em;

  @media screen and (min-width: $break-small) {
    margin: 0 auto; // Center
    line-height: 1.4em;
    width: 33em;
  }
}

p {
  text-align: justify;
  @media screen and (min-width: $break-small) {
    text-align: left;
  }
}

.footnotes {
  li {
    margin-bottom: 0.8em;
  }
}

sup {
  line-height: 0;
}

.post {
  .posted-at {
    font-size: 0.9em;
    color: $base0;
  }

  .title {
    margin-block-start: 0.4rem;
  }

  .subtitle {
    font-style: italic;
    color: $base02;
    margin-block-start: 0.7rem;
    margin-block-end: 1rem;
  }

  main {
    margin-block-start: 2.5rem;
  }
}

.list {
  .posted-at {
    text-align: right;
    padding-right: 0.5em;
    white-space: nowrap;
    vertical-align: top;
  }
  table {
    border-spacing: 2px 6px;
    @media screen and (min-width: $break-small) {
      border-spacing: 2px 2px;
    }
  }
}

.text-center {
  text-align: center;
}

.italic {
  font-style: italic;
}

ol ol {
  list-style-type: lower-alpha;
}
ol ol ol {
  list-style-type: lower-roman;
}

.math.inline {
  margin: 0 2px;
}

.next-container {
    display: flex;
    justify-content: flex-end;

    .next {
        font-style: italic;

        a::after {
            content: ". ☛";
        }
    }
}

.prev-container {
    display: flex;
    justify-content: flex-start;

    .prev {
        font-style: italic;

        a::before {
            content: "☚ ";
        }
        a::after {
            content: ".";
        }
    }
}

// binary-search-with-confidence
.array table {
  border-collapse: collapse;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2em;
  margin-top: 1.5em;

  td {
    padding: 0.4em;
    width: 2.5em;
    text-align: center;
  }

  tr:first-child td {
    border: 1px scale-color($base2, $lightness: -20%) solid;
    border-top: 0;
    border-bottom: 0;
  }
}

td:not(.bg-light-green) + td.bg-light-green {
  border-left: 1px scale-color($base2, $lightness: -20%) solid;
}

mjx-container {
  overflow-x: auto;
}

.bg-red {
  background-color: $red;
}
.bg-green {
  background-color: $green;
}
.bg-light-red {
  background-color: scale-color($red, $alpha: -60%);
}
.bg-light-green {
  background-color: scale-color($green, $alpha: -60%);
}
.red {
  color: $red;
}
.green {
  color: $green;
}
.dark-red {
  color: scale-color($red, $lightness: -50%);
}
.dark-green {
  color: scale-color($green, $lightness: -50%);
}
.heavy {
  font-weight: 600;
}

// binary-search-revisited
.chocolate td {
    background-color: #7B3F00;
    color: $base3;
}

.chocolate td:empty {
    background-color: inherit;
}

.chocolate {
    display: flex;
    flex-direction: column;
    align-items: center;

    .caption {
        margin-top: -1.75em;
        margin-bottom: 1.75em;
        font-size: 0.85em;
        line-height: 1.4em;
        text-align: center;
    }
}
`

const css = await sass.compileString(scss);
export default css.css;


