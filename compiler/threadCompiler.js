export function compileThread(source) {

  source = source
    .replace('@import Thread style', '')
    .trim()

  const lines = source
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  let css = ''

  const stack = []

  const aliases = {

    bg: 'background',
    text: 'color',
    radius: 'border-radius',
    size: 'font-size',
    weight: 'font-weight',
    pad: 'padding',
    margin: 'margin',
    w: 'width',
    h: 'height',
    align: 'text-align',
    gap: 'gap',
    border: 'border'
  }

  const presets = {

    shadow: {

      soft: '0 4px 12px rgba(0,0,0,0.12)',
      hard: '0 8px 24px rgba(0,0,0,0.25)'
    }
  }

  const numericProps = [

    'padding',
    'margin',
    'border-radius',
    'font-size',
    'width',
    'height',
    'gap'
  ]

  function normalizeProperty(prop) {
    return aliases[prop] || prop
  }

  function normalizeValue(prop, value) {

    if (presets[prop]?.[value]) {
      return presets[prop][value]
    }

    if (numericProps.includes(prop)) {

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

    if (line.endsWith('{')) {

      const selector = line
        .replace('{', '')
        .trim()

      stack.push(selector)

      css += `${selector} {\n`

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

      prop = normalizeProperty(prop)

      value = normalizeValue(prop, value)

      css += `  ${prop}: ${value};\n`
    }
    else {

      if (line === 'flex') {
        css += `  display: flex;\n`
      }

      if (line === 'row') {
        css += `  flex-direction: row;\n`
      }

      if (line === 'column') {
        css += `  flex-direction: column;\n`
      }

      if (line === 'center') {

        css += `  justify-content: center;\n`
        css += `  align-items: center;\n`
      }
    }
  }

  return css
}
