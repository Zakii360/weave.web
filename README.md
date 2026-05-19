# Weave.web

Unified programming language for:
- JavaScript
- HTML
- Chicken-Nuget rendering

## Usage

### JS Mode

```weave
@import JS ff

say("Hello")
```

### HTML Mode

```weave
@import HTML body

h1 "Hello"
```

## Compile

```bash
node compiler/cli.js examples/hello.web
```
