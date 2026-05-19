import { compileCSS } from '../../Thread-main/compiler/cssCompiler.js'

export function compileThread(source) {

  source = source
    .replace('@import Thread style', '')
    .trim()

  return compileCSS(source)
}
