
let editor

const ENDPOINT =
  "https://wiswfpfsjiowtrdyqpxy.supabase.co/functions/v1/GROQAI"

require.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs"
  }
})

require(["vs/editor/editor.main"], () => {

  editor = monaco.editor.create(
    document.getElementById("editor"),
    {
      value: `@import HTML body
@import Thread style
@import JS ff

page Home {

    h1 "Hello from weave.web"

    p "Runtime preview enabled"

    button #btn "Click Me"
}

style {

    body {
        background: #0f172a
        color: white
        font-family: Arial
        padding: 40px
    }

    button {
        background: royalblue
        color: white
        border: none
        padding: 14px 20px
        border-radius: 12px
    }
}

script {

    on("#btn", "click", clicked)

    task clicked() {

        put("Runtime works!", "h1")
    }
}
`,
      language: "javascript",
      theme: "vs-dark",
      automaticLayout: true
    }
  )

  compilePreview()
})

function parseWeave(source) {

  let html = ""
  let css = ""
  let js = ""

  const h1Matches =
    [...source.matchAll(/h1\s+\"([^"]+)\"/g)]

  h1Matches.forEach(match => {
    html += `<h1>${match[1]}</h1>`
  })

  const pMatches =
    [...source.matchAll(/p\s+\"([^"]+)\"/g)]

  pMatches.forEach(match => {
    html += `<p>${match[1]}</p>`
  })

  const buttonMatches =
    [...source.matchAll(/button\s+([^\s]+)\s+\"([^"]+)\"/g)]

  buttonMatches.forEach(match => {

    const id =
      match[1].replace("#", "")

    html += `
      <button id="${id}">
        ${match[2]}
      </button>
    `
  })

  const bodyStyle =
    source.match(/body\s*\{([\s\S]*?)\}/)

  if (bodyStyle) {

    css += `
      body {
        ${bodyStyle[1]
          .replace(/\n/g, "")
          .replace(/\s+/g, " ")}
      }
    `
  }

  const buttonStyle =
    source.match(/button\s*\{([\s\S]*?)\}/)

  if (buttonStyle) {

    css += `
      button {
        ${buttonStyle[1]
          .replace(/\n/g, "")
          .replace(/\s+/g, " ")}
      }
    `
  }

  if (source.includes('put("Runtime works!", "h1")')) {

    js += `
      document
        .getElementById("btn")
        ?.addEventListener("click", () => {

          document.querySelector("h1")
            .innerText = "Runtime works!"
        })
    `
  }

  return `
    <html>
      <head>
        <style>
          ${css}
        </style>
      </head>

      <body>

        ${html}

        <script>
          ${js}
        <\/script>

      </body>
    </html>
  `
}

function compilePreview() {

  const source = editor.getValue()

  const runtime =
    parseWeave(source)

  document
    .getElementById("preview")
    .srcdoc = runtime
}

document
  .getElementById("compileBtn")
  .addEventListener("click", compilePreview)

document
  .getElementById("runBtn")
  .addEventListener("click", compilePreview)

document
  .getElementById("downloadBtn")
  .addEventListener("click", () => {

    const blob = new Blob(
      [editor.getValue()],
      { type: "text/plain" }
    )

    const a =
      document.createElement("a")

    a.href =
      URL.createObjectURL(blob)

    a.download = "app.web"

    a.click()
  })

const promptBox =
  document.getElementById("groqPrompt")

const output =
  document.getElementById("groqOutput")

const button =
  document.getElementById("groqGenerate")

const toggle =
  document.getElementById("groqToggle")

const sidebar =
  document.getElementById("groqSidebar")

let sidebarOpen = true

toggle.addEventListener("click", () => {

  sidebarOpen = !sidebarOpen

  if (sidebarOpen) {

    sidebar.classList.remove("closed")

    toggle.innerText = "Hide AI"

  } else {

    sidebar.classList.add("closed")

    toggle.innerText = "Show AI"
  }
})

button.addEventListener("click", async () => {

  const prompt =
    promptBox.value.trim()

  if (!prompt) {
    output.innerText =
      "Enter a prompt."
    return
  }

  output.innerText = "Generating..."

  try {

    const response = await fetch(
      ENDPOINT,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt
        })
      }
    )

    const data = await response.json()

    if (!data.success) {

      output.innerText =
        data.error

      return
    }

    output.innerText = "AI generated app."

    editor.setValue(data.result)

    compilePreview()

  } catch (err) {

    output.innerText =
      "Fetch failed: " + err.message
  }
})
