function compileHTML(nodes) {

    let html = ""

    for (const line of nodes) {

        if (line.startsWith("title")) {

            const text = line.match(/"(.*?)"/)[1]

            html += `<title>${text}</title>`
        }

        else if (line.startsWith("h1")) {

            const text = line.match(/"(.*?)"/)[1]

            const id = line.match(/id=\"(.*?)\"/)

            html += `<h1 id="${id ? id[1] : ""}">${text}</h1>`
        }

        else if (line.startsWith("p")) {

            const text = line.match(/"(.*?)"/)[1]

            const id = line.match(/id=\"(.*?)\"/)

            html += `<p id="${id ? id[1] : ""}">${text}</p>`
        }

        else if (line.startsWith("button")) {

            const text = line.match(/"(.*?)"/)[1]

            const id = line.match(/id=\"(.*?)\"/)

            html += `<button id="${id ? id[1] : ""}">${text}</button>`
        }

        else if (line.startsWith("div")) {

            const id = line.match(/id=\"(.*?)\"/)

            html += `<div id="${id ? id[1] : ""}"></div>`
        }
    }

    return html
}

module.exports = compileHTML
