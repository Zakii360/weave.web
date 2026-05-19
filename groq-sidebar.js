
const ENDPOINT =
  "https://wiswfpfsjiowtrdyqpxy.supabase.co/functions/v1/GROQAI"

const promptBox =
  document.getElementById("groqPrompt")

const output =
  document.getElementById("groqOutput")

const button =
  document.getElementById("groqGenerate")

button.addEventListener("click", async () => {

  const prompt = promptBox.value

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
