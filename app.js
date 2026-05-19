
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

    button #btn "Click Me"
}

style {

    body {
        background: #0f172a
        color: white
    }
}

script {

    on("#btn", "click", clicked)

    task clicked() {

        put("AI + weave.web works!", "h1")
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

function compilePreview() {

  const source = editor.getValue()

  document.getElementById("preview").srcdoc = `
    <html>
      <body style="
        background:#0f172a;
        color:white;
        font-family:Arial;
        padding:40px;
      ">
        <pre>${source
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}
        </pre>
      </body>
    </html>
  `
}

document.getElementById("compileBtn")
  .addEventListener("click", compilePreview)

document.getElementById("runBtn")
  .addEventListener("click", compilePreview)

document.getElementById("downloadBtn")
  .addEventListener("click", () => {

    const blob = new Blob(
      [editor.getValue()],
      { type: "text/plain" }
    )

    const a = document.createElement("a")

    a.href = URL.createObjectURL(blob)

    a.download = "app.web"

    a.click()
  })

/* ===========================
   GROQ AI SIDEBAR
=========================== */

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

  const prompt = promptBox.value.trim()

  if (!prompt) {
    output.innerText = "Enter a prompt."
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
      output.innerText = data.error
      return
    }

    output.innerText = data.result

    if (editor) {
      editor.setValue(data.result)
      compilePreview()
    }

  } catch (err) {

    output.innerText =
      "Fetch failed: " + err.message
  }
})
