import { compileCSS } from '../../Thread-main/compiler/cssCompiler.js'

export function compileThread(source) {

  source = source
    .replace('@import Thread style', '')
    .replace('@import c-nuget body', '')
    .replace('@import Weave ff', '')
    .trim()

  return compileCSS(source)
}
