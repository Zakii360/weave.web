export function compileThread(source) {

  const lines = source
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  let css = ''

  const stack = []

  const shortcuts = {

    bg: 'background',
    text: 'color',
    pad: 'padding',
    radius: 'border-radius',
    w: 'width',
    h: 'height',
    size: 'font-size',
    weight: 'font-weight',
    shadow: 'box-shadow',
    border: 'border',
    flexdir: 'flex-direction',
    items: 'align-items',
    justify: 'justify-content',
    gap: 'gap'
  }

  function formatValue(prop, value) {

    if (
      ['padding', 'margin', 'border-radius', 'width', 'height', 'font-size', 'gap']
      .includes(prop)
    ) {

      return value
        .split(' ')
        .map(v => {

          if (!isNaN(v)) {
            return v + 'px'
          }

          return v
        })
        .join(' ')
    }

    return value
  }

  for (const line of lines) {

    if (line.startsWith('thread ')) {

      const selector = line
        .replace('thread ', '')
        .replace('{', '')
        .trim()

      stack.push(selector)

      css += `${selector} {\n`

      continue
    }

    if (line.endsWith('{')) {

      const nested = line.replace('{', '').trim()

      const parent = stack[stack.length - 1]

      let selector = ''

      if (nested === 'hover') {
        selector = `${parent}:hover`
      }
      else if (nested === 'focus') {
        selector = `${parent}:focus`
      }
      else {
        selector = `${parent} ${nested}`
      }

      stack.push(selector)

      css += `}\n\n${selector} {\n`

      continue
    }

    if (line === '}') {

      stack.pop()

      css += '}\n'

      continue
    }

    const colon = line.indexOf(':')

    if (colon !== -1) {

      let prop = line.slice(0, colon).trim()
      let value = line.slice(colon + 1).trim()

      if (shortcuts[prop]) {
        prop = shortcuts[prop]
      }

      if (prop === 'glow') {

        css += `  box-shadow: 0 0 20px ${value};\n`

        continue
      }

      if (prop === 'scale') {

        css += `  transform: scale(${value});\n`

        continue
      }

      value = formatValue(prop, value)

      css += `  ${prop}: ${value};\n`
    }
  }

  return css
}
