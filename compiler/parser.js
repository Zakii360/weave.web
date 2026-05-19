export function parse(source) {
    const lines = source.split("\n");

    return lines.map(line => ({
        type: "Line",
        value: line.trim()
    }));
}
