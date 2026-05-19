export function compileHTML(ast) {

  const source = ast.tokens
    .map(t => t.value)
    .join(' ')

  let html = ''

  const titleMatch = source.match(/title\s+\"([^\"]+)\"/)

  const h1Match = source.match(
    /h1(?:\s+id=\"([^\"]+)\")?\s+\"([^\"]+)\"/
  )

  const buttonMatch = source.match(
    /button(?:\s+id=\"([^\"]+)\")?\s+\"([^\"]+)\"/
  )

  html += `<!DOCTYPE html>
<html>
<head>
<title>${titleMatch?.[1] || 'Weave.web'}</title>
</head>
<body>
`

  if (h1Match) {
    html += `<h1 id="${h1Match[1] || ''}">
${h1Match[2]}
</h1>`
  }

  if (buttonMatch) {
    html += `<button id="${buttonMatch[1] || ''}">
${buttonMatch[2]}
</button>`
  }

  html += `
</body>
</html>
`

  return html
}
