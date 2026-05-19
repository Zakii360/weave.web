export async function compileHTML(source) {
    const lines = source.split("\n");

    lines.shift();

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
