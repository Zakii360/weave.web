import { compileJS } from "./jsTarget.js";
import { compileHTML } from "./htmlTarget.js";

export async function compile(source) {
    const firstLine = source.split("\n")[0].trim();

    if (firstLine.startsWith("@import JS")) {
        return compileJS(source);
    }

    if (firstLine.startsWith("@import HTML")) {
        return await compileHTML(source);
    }

    throw new Error("Unknown backend import.");
}
