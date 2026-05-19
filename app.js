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

    p "AI Runtime Enabled"

    button #btn "Click Me"
}

style {

    body {
        background: #0f172a
        color: white
        padding: 40px
        font-family: Arial
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
    [...source.matchAll(/h1\\s+\\"([^"]+)\\"/g)]

  h1Matches.forEach(match => {
    html += `<h1>${match[1]}</h1>`
  })

  const pMatches =
    [...source.matchAll(/p\\s+\\"([^"]+)\\"/g)]

  pMatches.forEach(match => {
    html += `<p>${match[1]}</p>`
  })

  const buttonMatches =
    [...source.matchAll(/button\\s+([^\\s]+)\\s+\\"([^"]+)\\"/g)]

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
    source.match(/body\\s*\\{([\\s\\S]*?)\\}/)

  if (bodyStyle) {

    css += `
      body {
        ${bodyStyle[1]
          .replace(/\\n/g, "")
          .replace(/\\s+/g, " ")}
      }
    `
  }

  const buttonStyle =
    source.match(/button\\s*\\{([\\s\\S]*?)\\}/)

  if (buttonStyle) {

    css += `
      button {
        ${buttonStyle[1]
          .replace(/\\n/g, "")
          .replace(/\\s+/g, " ")}
      }
    `
  }

  js += `
    document
      .querySelectorAll("button")
      .forEach(btn => {

        btn.addEventListener("click", () => {

          const h1 =
            document.querySelector("h1")

          if (h1) {
            h1.innerText = "Runtime works!"
          }
        })
      })
  `

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
        <\\/script>

      </body>
    </html>
  `
}

function compilePreview() {

  if (!editor) return

  const source = editor.getValue()

  const runtime =
    parseWeave(source)

  document
    .getElementById("preview")
    .srcdoc = runtime
}

document
  .getElementById("compileBtn")
  ?.addEventListener("click", compilePreview)

document
  .getElementById("runBtn")
  ?.addEventListener("click", compilePreview)

document
  .getElementById("downloadBtn")
  ?.addEventListener("click", () => {

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

/* =========================
   GROQ AI SIDEBAR
========================= */

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

toggle?.addEventListener("click", () => {

  sidebarOpen = !sidebarOpen

  if (sidebarOpen) {

    sidebar.classList.remove("closed")

    toggle.innerText = "Hide AI"

  } else {

    sidebar.classList.add("closed")

    toggle.innerText = "Show AI"
  }
})

async function callGroq(prompt) {

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

  const raw =
    await response.text()

  let data = {}

  try {

    data = JSON.parse(raw)

  } catch {

    throw new Error(raw)
  }

  if (!response.ok) {

    throw new Error(
      data.error || "Request failed"
    )
  }

  if (!data.result) {

    console.log(data)

    throw new Error(
      "AI returned no result."
    )
  }

  return data.result
}

button?.addEventListener("click", async () => {

  const prompt =
    promptBox.value.trim()

  if (!prompt) {

    output.innerText =
      "Enter a prompt."

    return
  }

  output.innerText =
    "Generating..."

  try {

    const result =
      await callGroq(prompt)

    output.innerText =
      "AI generated app."

    editor.setValue(result)

    compilePreview()

  } catch (err) {

    console.error(err)

    output.innerText =
      "AI Error:\\n\\n" + err.message
  }
})
