function compileThread(lines) {

    let css = ""

    let selector = null

    for (const line of lines) {

        if (line.startsWith("thread")) {

            selector = line.replace("thread", "").replace("{", "").trim()

            css += `${selector} {`

            continue
        }

        if (line === "}") {

            css += `}`

            continue
        }

        if (line.includes(":")) {

            let [prop, value] = line.split(":")

            prop = prop.trim()
            value = value.trim()

            const map = {
                bg: "background",
                text: "color",
                size: "font-size",
                pad: "padding",
                radius: "border-radius"
            }

            if (map[prop]) {
                prop = map[prop]
            }

            if (!isNaN(value)) {
                value += "px"
            }

            css += `${prop}:${value};`
        }
    }

    return css
}

module.exports = compileThread
