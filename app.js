import { compile } from './compiler/compiler.js'

let editor

require.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs'
  }
})

require(['vs/editor/editor.main'], async () => {

  editor = monaco.editor.create(
    document.getElementById('editor'),
    {

      value: `@import HTML body
@import JS ff
@import Thread style

page {

    title "Thread Integrated"

    body {

        h1 id="title" "Hello"

        button id="btn" "Click"
    }
}

style {

    body {

        background: #111827
        color: white
        font-family: Inter
    }

    button {

        background: royalblue
        color: white
        padding: 14px
        border-radius: 14px
    }
}

script {

    on("#btn", "click", clicked)

    task clicked() {

        put("Clicked!", "#title")
    }
}
`,
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true
    }
  )

  compileCurrent()
})

function compileCurrent() {

  const source = editor.getValue()

  const result = compile(source)

  document.getElementById('preview')
    .srcdoc = result.html
}

document.getElementById('compileBtn')
  .addEventListener('click', compileCurrent)
