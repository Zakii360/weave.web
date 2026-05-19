export function compileThread(source) {

  const lines = source
    .split('\n')
    .map(line => line.trim())

  let css = ''
  let insideBlock = false

  for (const line of lines) {

    if (line.endsWith('{')) {
      insideBlock = true
      css += line + '\n'
      continue
    }

    if (line === '}') {
      insideBlock = false
      css += '}\n'
      continue
    }

    if (insideBlock && line.length > 0) {

      const colon = line.indexOf(':')

      if (colon !== -1) {

        const prop = line.slice(0, colon).trim()
        const value = line.slice(colon + 1).trim()

        css += `  ${prop}: ${value};\n`
      }
    }
  }

  return css
}
