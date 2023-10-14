// To get this to work, have to delete
// && typeof process.browser === "undefined";
// from pyodide sources.
import { loadPyodide } from "pyodide";

const pyodide = await loadPyodide({
  indexURL: "pyodide-0.24.1",
  packages: ["pygments"],
});

const light = pyodide.runPython(`from pygments.formatters import HtmlFormatter
HtmlFormatter(style="solarized-light").get_style_defs()`) //+ `.err { background-color: inherit; }`

const dark = pyodide.runPython(`from pygments.formatters import HtmlFormatter
HtmlFormatter(style="solarized-dark").get_style_defs()`);

const adaptive = `
${light}

@media (prefers-color-scheme: dark) {
  ${dark}
}
`;

export default light;
