import { lex } from './lexer.js'
import { parse } from './parser.js'
import { compileHTML } from './htmlCompiler.js'
import { compileJS } from './jsCompiler.js'
import { compileThread } from './threadCompiler.js'

export function compile(source) {

  const tokens = lex(source)

  const ast = parse(tokens)

  const html = compileHTML(ast)

  const js = compileJS(ast)

  const css = compileThread(source)

  const finalHTML = `
${html}

<style>
${css}
</style>

<script>
${js}
</script>
`

  return {
    html: finalHTML,
    js,
    css
  }
}
