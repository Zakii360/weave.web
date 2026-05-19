function compileJS(lines) {

    let js = ""

    for (const line of lines) {

        if (line.startsWith("on(")) {

            const match = line.match(/on\("(.*?)"\)/)

            if (match) {

                js += `
                document.querySelector("${match[1]}")
                .addEventListener("click", () => {
                    console.log("clicked")
                })
                `
            }
        }

        else {
            js += line + "\n"
        }
    }

    return js
}

module.exports = compileJS
