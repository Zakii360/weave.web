function parse(source) {

    const lines = source
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean)

    const ast = {
        imports: [],
        page: [],
        style: [],
        js: []
    }

    let mode = null

    for (const line of lines) {

        if (line.startsWith("@import")) {
            ast.imports.push(line)
            continue
        }

        if (line.startsWith("page")) {
            mode = "page"
            continue
        }

        if (line.startsWith("style")) {
            mode = "style"
            continue
        }

        if (line.startsWith("ff")) {
            mode = "js"
            continue
        }

        if (line === "{" || line === "}") {
            continue
        }

        if (mode === "page") {
            ast.page.push(line)
        }

        if (mode === "style") {
            ast.style.push(line)
        }

        if (mode === "js") {
            ast.js.push(line)
        }
    }

    return ast
}

module.exports = parse
