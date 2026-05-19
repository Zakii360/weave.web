export function compileJS(source) {
    let lines = source.split("\n");

    lines.shift();

    let output = [];

    for (let line of lines) {
        line = line.trim();

        if (line.startsWith("say(")) {
            output.push(
                line.replace("say(", "console.log(") + ";"
            );
            continue;
        }

        if (line.startsWith("let ")) {
            output.push(line + ";");
            continue;
        }

        output.push(line);
    }

    return output.join("\n");
}
