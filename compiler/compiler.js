import { compileHTML } from './htmlCompiler.js'
import { compileJS } from './jsCompiler.js'
import { compileThread } from './threadCompiler.js'

export function compile(source) {

  if (source.startsWith('@import c-nuget body')) {
    return compileHTML(source)
  }

  if (source.startsWith('@import Weave ff')) {
    return compileJS(source)
  }

  if (source.startsWith('@import Thread style')) {
    return compileThread(source)
  }

  throw new Error('Unknown .web import type')
}
