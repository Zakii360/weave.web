import parse from "./parser.js"
import compileHTML from "./htmlCompiler.js"
import compileThread from "./threadCompiler.js"
import compileJS from "./jsCompiler.js"

export function compile(source) {

    const ast = parse(source)

    const html = compileHTML(ast.page)
    const css = compileThread(ast.style)
    const js = compileJS(ast.js)

    return {
        html: `
<style>
${css}
</style>

${html}

<script>
${js}
</script>
`
    }
}
