const ENDPOINT =
  "https://wiswfpfsjiowtrdyqpxy.supabase.co/functions/v1/GROQAI"

const generateBtn =
  document.getElementById("generateBtn")

const promptInput =
  document.getElementById("prompt")

const output =
  document.getElementById("output")

generateBtn.addEventListener("click", async () => {

  const prompt = promptInput.value

  output.innerText = "Generating..."

  try {

    const response = await fetch(
      ENDPOINT,
      {
        method: "POST",
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

  } catch (err) {

    output.innerText = err.message
  }
})
