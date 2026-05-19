import { compile } from './compiler/compiler.js'

let editor

require.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs'
  }
})

require(['vs/editor/editor.main'], async () => {

  editor = monaco.editor.create(document.getElementById('editor'), {
    value: `@import HTML body
@import JS ff

page {
    title "Weave.web"

    body {
        h1 id="title" "Hello World"
        button id="btn" "Click Me"
    }
}

script {
    on("#btn", "click", clicked)

    task clicked() {
        put("You clicked the button!", "#title")
    }
}
`,
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true
  })

  compileCurrent()
})

function compileCurrent() {
  const source = editor.getValue()
  const result = compile(source)
  document.getElementById('preview').srcdoc = result.html
}

document.getElementById('compileBtn')
  .addEventListener('click', compileCurrent)

document.getElementById('runBtn')
  .addEventListener('click', compileCurrent)
