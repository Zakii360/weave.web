
const ENDPOINT =
  "https://wiswfpfsjiowtrdyqpxy.supabase.co/functions/v1/GROQAI"

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
    output.innerText = "Enter a prompt first."
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
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          prompt
        })
      }
    )

    if (!response.ok) {

      const text = await response.text()

      output.innerText =
        `HTTP ${response.status}\n\n${text}`

      return
    }

    const data = await response.json()

    if (!data.success) {

      output.innerText =
        data.error || "Unknown GROQ error"

      return
    }

    output.innerText = data.result

  } catch (err) {

    output.innerText =
      `Fetch failed:\n\n${err.message}\n\nLikely CORS issue in Supabase Edge Function.`
  }
})
