export function put(text, selector) {
  document.querySelector(selector).innerText = text
}

export function say(text) {
  console.log(text)
}
