function compileWeave() {
    const source = document.getElementById("editor").value;
    const lines = source.split("\n");

    const firstLine = lines[0].trim();

    let output = "";

    if (firstLine.startsWith("@import JS")) {
        output = compileJS(lines.slice(1));
    } else if (firstLine.startsWith("@import HTML")) {
        output = compileHTML(lines.slice(1));
    } else {
        output = "Unknown backend import.";
    }

    document.getElementById("output").textContent = output;
}

function compileJS(lines) {
    let result = [];

    for (let raw of lines) {
        let line = raw.trim();

        if (!line) continue;

        if (line.startsWith("say(")) {
            result.push(
                line.replace("say(", "console.log(") + ";"
            );
            continue;
        }

        if (line.startsWith("let ")) {
            result.push(line + ";");
            continue;
        }

        result.push(line);
    }

    return result.join("\n");
}

function compileHTML(lines) {
    let html = [];

    html.push("<!DOCTYPE html>");
    html.push("<html>");
    html.push("<body>");

    for (let raw of lines) {
        let line = raw.trim();

        if (!line) continue;

        if (line.startsWith("h1 ")) {
            html.push(`<h1>${extractText(line)}</h1>`);
            continue;
        }

        if (line.startsWith("p ")) {
            html.push(`<p>${extractText(line)}</p>`);
            continue;
        }

        if (line.startsWith("button ")) {
            html.push(`<button>${extractText(line)}</button>`);
            continue;
        }

        if (line.startsWith("div")) {
            html.push("<div>");
            continue;
        }

        if (line === "}") {
            html.push("</div>");
            continue;
        }
    }

    html.push("</body>");
    html.push("</html>");

    return html.join("\n");
}

function extractText(line) {
    const match = line.match(/"(.*?)"/);
    return match ? match[1] : "";
}

compileWeave();
