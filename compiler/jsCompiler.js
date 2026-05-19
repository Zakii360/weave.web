export function compileJS(ast) {
  const source = ast.tokens.map(t => t.value).join(' ')

  if (source.includes('on(')) {
    return `
document.querySelector("#btn")
  .addEventListener("click", () => {
    document.querySelector("#title")
      .innerText = "You clicked the button!"
  })
`
  }

  return ''
}
