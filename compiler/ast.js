export class ProgramNode {
    constructor(body = []) {
        this.type = "Program";
        this.body = body;
    }
}

export class ElementNode {
    constructor(tag, children = []) {
        this.type = "Element";
        this.tag = tag;
        this.children = children;
    }
}

export class TextNode {
    constructor(value) {
        this.type = "Text";
        this.value = value;
    }
}
