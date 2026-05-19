const parse = require("./parser")
const compileHTML = require("./htmlCompiler")
const compileThread = require("./threadCompiler")
const compileJS = require("./jsCompiler")

function compile(source) {

    const ast = parse(source)

    const html = compileHTML(ast.page)
    const css = compileThread(ast.style)
    const js = compileJS(ast.js)

    return `
    <style>
    ${css}
    </style>

    ${html}

    <script>
    ${js}
    </script>
    `
}

module.exports = compile
