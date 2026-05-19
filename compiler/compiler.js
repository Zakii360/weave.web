import { lex } from './lexer.js'
import { parse } from './parser.js'
import { compileHTML } from './htmlCompiler.js'
import { compileJS } from './jsCompiler.js'

export function compile(source) {
  const tokens = lex(source)
  const ast = parse(tokens)

  const html = compileHTML(ast)
  const js = compileJS(ast)

  return {
    html: `${html}<script>${js}</script>`,
    js
  }
}
