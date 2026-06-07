/* =============================================
   WEAVE.WEB — APP.JS
   .web is a universal container. @import lines
   at the top declare which language each block
   uses — like <script type="..."> but for .web
   
   @import HTML body    → chicken-nuget (HTML elements)
   @import Thread style → Thread (CSS with aliases/nesting)
   @import JS ff        → Weave (say/put/on/load/ping/task)
============================================= */

const AI_ENDPOINT = "https://tvxugmumfvgnvjacwwfz.supabase.co/functions/v1/GROQAI"

// ── EXAMPLES ──────────────────────────────────

const EXAMPLES = {
  main: `@import HTML body
@import Thread style
@import JS ff

page Home {

    h1 "Hello from weave.web"
    p "Build HTML, CSS, and JS in one .web file"
    button #btn "Click Me"
}

style {

    body {
        bg: #0f172a
        text: white
        pad: 40
        font-family: Arial
    }

    h1 {
        text: #6ee7b7
        size: 32
        margin-bottom: 12
    }

    p {
        text: #94a3b8
        margin-bottom: 24
    }

    button {
        bg: royalblue
        text: white
        border: none
        pad: 14 20
        radius: 12
        pointer
    }
}

script {

    on("#btn", "click", clicked)

    task clicked() {
        put("It works!", "#btn")
    }
}`,

  hello: `@import HTML body

page {
    title "Hello World"

    h1 "Hello, World!"
    p "My first weave.web page."
}`,

  weave: `@import JS ff

// Weave — compiles to JavaScript
// say, put, on, load, ping, task, let

let name = "weave.web"

say("Hello from " + name)

task greet(person) {
    return "Hey, " + person + "!"
}

say(greet(name))`,

  thread: `@import Thread style

// Thread — CSS with aliases and shorthand
// bg, text, pad, radius, size, weight, shadow
// flex, row, column, center, wrap, rounded, pointer

hero {

    flex
    column
    center

    bg: #0a0a0f
    text: white
    h: 100vh
    gap: 20

    title {
        size: 48
        weight: bold
    }

    subtitle {
        size: 20
        text: #7878a0
    }

    button {
        bg: royalblue
        text: white
        pad: 14 24
        radius: 16
        shadow: soft
        pointer
    }
}`,

  hybrid: `@import HTML body
@import Thread style
@import JS ff

// Full hybrid — all three languages in one .web file

page Dashboard {

    h1 "Score: 0"
    p "Click the button to score points"
    button #btn "Score!"
    h2 #msg ""
}

style {

    body {
        bg: #0f172a
        text: white
        pad: 60
        font-family: Arial
        flex
        column
        center
        min-height: 100vh
    }

    h1 {
        text: #6ee7b7
        size: 40
        margin-bottom: 12
    }

    p {
        text: #94a3b8
        margin-bottom: 24
    }

    button {
        bg: #6ee7b7
        text: #0f172a
        border: none
        pad: 14 28
        radius: 12
        size: 16
        weight: bold
        pointer
        margin-bottom: 16
    }

    h2 {
        text: #fb923c
        size: 24
    }
}

script {

    let score = 0

    on("#btn", "click", addPoint)

    task addPoint() {
        score = score + 1
        put("Score: " + score, "h1")
        if (score >= 10) {
            put("You win! 🎉", "#msg")
        }
    }
}`
}

// ── GLOBALS ───────────────────────────────────

var editor = null
var lastCompiledHTML = ''
var showingOutput = false
var aiOpen = false

// ── MONACO SETUP ──────────────────────────────

require.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' }
})

require(['vs/editor/editor.main'], function () {

  monaco.languages.register({ id: 'weave' })

  // Monarch tokenizer — NOTE: do NOT spell the word i-m-p-o-r-t anywhere
  // in a regex pattern; Monarch scans regex source strings for reserved words.
  // We match @-directives as /@[a-z]+\b.*/ instead.
  monaco.languages.setMonarchTokensProvider('weave', {
    tokenizer: {
      root: [
        [/@[a-z]+\b.*$/,                                              'keyword.directive'],
        [/\/\/.*/,                                                    'comment'],
        [/\b(page|style|script)\b/,                                   'keyword.block'],
        [/\b(task|let|return|if|else|for|while)\b/,                   'keyword.control'],
        [/\b(say|put|on|load|ping)\b/,                                'keyword.builtin'],
        [/\b(h[1-6]|p|div|span|button|input|a|section|nav|header|footer|main|ul|li)\b/, 'tag'],
        [/\b(flex|row|column|center|wrap|rounded|pointer|bold|italic|block|none)\b/,     'keyword.shorthand'],
        [/\b(bg|text|pad|radius|size|weight|shadow|margin|gap|border|w|h|align)\b/,     'keyword.alias'],
        [/"[^"]*"/,                                                   'string'],
        [/'[^']*'/,                                                   'string'],
        [/#[\w-]+/,                                                   'type'],
        [/\d+(\.\d+)?/,                                               'number'],
        [/[{}]/,                                                      'delimiter.bracket'],
        [/[()]/,                                                      'delimiter.paren'],
      ]
    }
  })

  monaco.editor.defineTheme('weave-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword.directive', foreground: '818cf8', fontStyle: 'italic' },
      { token: 'keyword.block',     foreground: 'c084fc', fontStyle: 'bold' },
      { token: 'keyword.control',   foreground: '818cf8' },
      { token: 'keyword.builtin',   foreground: '38bdf8' },
      { token: 'keyword.shorthand', foreground: 'fb923c' },
      { token: 'keyword.alias',     foreground: 'fbbf24' },
      { token: 'tag',               foreground: '6ee7b7' },
      { token: 'string',            foreground: 'a3e635' },
      { token: 'type',              foreground: '38bdf8' },
      { token: 'number',            foreground: 'fb923c' },
      { token: 'comment',           foreground: '3f3f5a', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background':                '#0a0a0f',
      'editor.foreground':                '#e8e8f0',
      'editorLineNumber.foreground':      '#2a2a40',
      'editorLineNumber.activeForeground':'#4a4a6a',
      'editor.selectionBackground':       '#1e1e3088',
      'editor.lineHighlightBackground':   '#0f0f1a',
      'editorCursor.foreground':          '#6ee7b7',
    }
  })

  editor = monaco.editor.create(
    document.getElementById('editor'),
    {
      value: EXAMPLES.main,
      language: 'weave',
      theme: 'weave-dark',
      automaticLayout: true,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13,
      lineHeight: 22,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'gutter',
      cursorBlinking: 'smooth',
      smoothScrolling: true,
      padding: { top: 16, bottom: 16 },
      wordWrap: 'off',
    }
  )

  editor.onDidChangeCursorPosition(function (e) {
    document.getElementById('lineColStatus').textContent =
      'Ln ' + e.position.lineNumber + ', Col ' + e.position.column
  })

  var compileTimer
  editor.onDidChangeModelContent(function () {
    clearTimeout(compileTimer)
    compileTimer = setTimeout(compileAndPreview, 600)
  })

  compileAndPreview()
})

// ══════════════════════════════════════════════
//   COMPILER
//   Reads @import declarations to know which
//   language mode to use for each block.
// ══════════════════════════════════════════════

function compileWeave(source) {

  // Parse all @import declarations
  var imports = {}
  var importRe = /^@[a-z]+\s+(\w+)\s+(\w+)/gim
  var m
  while ((m = importRe.exec(source)) !== null) {
    // @import HTML body  → imports.HTML = "body"
    // @import Thread style → imports.Thread = "style"
    // @import JS ff       → imports.JS = "ff"
    imports[m[1]] = m[2]
  }

  var hasHTML   = !!imports.HTML
  var hasThread = !!imports.Thread
  var hasJS     = !!imports.JS

  // Strip all @import lines
  var body = source.replace(/^@[a-z]+\s+\w+\s+\w+\s*$/gim, '').trim()

  var title    = 'weave.web'
  var bodyHTML = ''
  var cssOut   = ''
  var jsOut    = ''

  // ── HTML / chicken-nuget block ────────────────
  if (hasHTML) {
    var pageM = body.match(/page(?:\s+\w+)?\s*\{([\s\S]*?)\n\}/)
    if (pageM) {
      var pageContent = pageM[1]
      var titleM = pageContent.match(/title\s+"([^"]+)"/)
      if (titleM) title = titleM[1]
      bodyHTML = compileHTMLBlock(pageContent)
    }
  }

  // ── Thread CSS block ──────────────────────────
  if (hasThread) {
    // style block: everything between `style {` and the matching closing `}`
    // accounting for nested blocks inside
    var styleStart = body.indexOf('\nstyle ')
    if (styleStart === -1) styleStart = body.indexOf('\nstyle{')
    if (styleStart === -1 && body.startsWith('style')) styleStart = -1  // handle top-level

    var styleBlock = extractBlock(body, /\bstyle(?:\s+\w+)?\s*\{/)
    if (styleBlock !== null) {
      cssOut = compileThreadBlock(styleBlock)
    }
  }

  // ── Weave JS block ────────────────────────────
  if (hasJS) {
    var scriptBlock = extractBlock(body, /\bscript\s*\{/)
    if (scriptBlock !== null) {
      jsOut = compileWeaveBlock(scriptBlock)
    }
  }

  // ── Pure Weave file (no HTML import) ─────────
  // If there's no HTML import, treat whole file as Weave JS
  if (!hasHTML && !hasThread && hasJS) {
    jsOut = compileWeaveBlock(body)
    return buildJSOnlyPage(jsOut)
  }

  // ── Pure Thread file ──────────────────────────
  if (!hasHTML && hasThread && !hasJS) {
    var threadBlock = extractBlock(body, /\{/) // whole file is Thread
    if (threadBlock === null) threadBlock = body
    cssOut = compileThreadBlock(body)
    return buildThreadPreviewPage(cssOut)
  }

  return buildFullPage(title, bodyHTML, cssOut, jsOut)
}

// ── Block extractor: finds content between { } of a pattern match ──

function extractBlock(source, pattern) {
  var m = pattern.exec(source)
  if (!m) return null

  var start = source.indexOf('{', m.index + m[0].length - 1)
  if (start === -1) return null

  var depth = 0
  var i = start
  while (i < source.length) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      depth--
      if (depth === 0) return source.slice(start + 1, i)
    }
    i++
  }
  return null
}

// ══════════════════════════════════════════════
//   HTML / CHICKEN-NUGET COMPILER
//   page { h1 "text"  p "text"  button #id "text" ... }
// ══════════════════════════════════════════════

function compileHTMLBlock(content) {
  var html = ''
  var lines = content.split('\n').map(function(l){ return l.trim() }).filter(Boolean)

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (!line || line.startsWith('title ') || line.startsWith('//')) continue
    html += parseHTMLElement(line)
  }

  return html
}

function parseHTMLElement(line) {
  // h1–h6 [id="x"] "text"   or   h1 #id "text"
  var hm = line.match(/^(h[1-6])(?:\s+(?:id="([\w-]+)"|#([\w-]+)))?\s+"([^"]+)"$/)
  if (hm) {
    var id = hm[2] || hm[3] || ''
    return '<' + hm[1] + (id ? ' id="' + id + '"' : '') + '>' + esc(hm[4]) + '</' + hm[1] + '>\n  '
  }

  // p [#id] "text"
  var pm = line.match(/^p(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (pm) return '<p' + (pm[1] ? ' id="' + pm[1] + '"' : '') + '>' + esc(pm[2]) + '</p>\n  '

  // button [#id] "text"
  var bm = line.match(/^button(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (bm) return '<button' + (bm[1] ? ' id="' + bm[1] + '"' : '') + '>' + esc(bm[2]) + '</button>\n  '

  // input [#id] "placeholder"
  var im = line.match(/^input(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (im) return '<input' + (im[1] ? ' id="' + im[1] + '"' : '') + ' placeholder="' + esc(im[2]) + '" />\n  '

  // a #id "text"  or  a "text" href="url"
  var am = line.match(/^a(?:\s+#([\w-]+))?\s+"([^"]+)"(?:\s+href="([^"]+)")?$/)
  if (am) return '<a' + (am[1] ? ' id="' + am[1] + '"' : '') + (am[3] ? ' href="' + am[3] + '"' : '') + '>' + esc(am[2]) + '</a>\n  '

  // span [#id] "text"
  var sm = line.match(/^span(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (sm) return '<span' + (sm[1] ? ' id="' + sm[1] + '"' : '') + '>' + esc(sm[2]) + '</span>\n  '

  // div / section / header / nav / footer / main / article  [#id] "text"
  var dm = line.match(/^(div|section|header|nav|footer|main|article|ul|li)(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (dm) return '<' + dm[1] + (dm[2] ? ' id="' + dm[2] + '"' : '') + '>' + esc(dm[3]) + '</' + dm[1] + '>\n  '

  return ''
}

// ══════════════════════════════════════════════
//   THREAD CSS COMPILER
//   Aliases: bg, text, pad, radius, size, weight, shadow, w, h, align, gap
//   Shorthands: flex, row, column, center, wrap, rounded, pointer, bold, italic
//   Presets: shadow: soft | hard
//   Numeric: raw numbers get 'px' appended
//   Nested selectors supported
// ══════════════════════════════════════════════

var THREAD_ALIASES = {
  bg: 'background', text: 'color', radius: 'border-radius',
  size: 'font-size', weight: 'font-weight', pad: 'padding',
  margin: 'margin', w: 'width', h: 'height', align: 'text-align',
  gap: 'gap', border: 'border'
}

var THREAD_PRESETS = {
  shadow: {
    soft: '0 4px 12px rgba(0,0,0,0.12)',
    hard: '0 8px 24px rgba(0,0,0,0.25)'
  }
}

var THREAD_NUMERIC = [
  'padding','margin','border-radius','font-size','width','height',
  'gap','min-height','max-width','line-height','letter-spacing',
  'top','left','right','bottom','min-width'
]

function compileThreadBlock(source) {
  // Parse into AST then render, to support nested selectors
  var ast = parseThreadAST(source)
  var css = ''
  for (var i = 0; i < ast.length; i++) {
    css += renderThreadRule(ast[i], '')
  }
  return css
}

function parseThreadAST(source) {
  var lines = source.split('\n').map(function(l){ return l.trim() }).filter(function(l){ return l && !l.startsWith('//') })
  var ast = []
  var stack = []

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]

    if (line.endsWith('{')) {
      var sel = line.slice(0, -1).trim()
      var node = { selector: sel, properties: [], children: [] }
      if (stack.length === 0) ast.push(node)
      else stack[stack.length - 1].children.push(node)
      stack.push(node)
      continue
    }

    if (line === '}') {
      stack.pop()
      continue
    }

    if (stack.length === 0) continue

    var colon = line.indexOf(':')
    if (colon > 0) {
      stack[stack.length - 1].properties.push({ key: line.slice(0, colon).trim(), value: line.slice(colon + 1).trim() })
    } else {
      stack[stack.length - 1].properties.push({ key: line, value: true })
    }
  }

  return ast
}

function renderThreadRule(rule, parent) {
  var selector = parent ? parent + ' ' + rule.selector : rule.selector
  var css = selector + ' {\n'

  for (var i = 0; i < rule.properties.length; i++) {
    var p = rule.properties[i]
    css += renderThreadProperty(p.key, p.value)
  }

  css += '}\n\n'

  for (var j = 0; j < rule.children.length; j++) {
    css += renderThreadRule(rule.children[j], selector)
  }

  return css
}

function renderThreadProperty(key, value) {
  // Boolean shorthand keywords
  var shorthands = {
    flex:     '  display: flex;\n',
    row:      '  flex-direction: row;\n',
    column:   '  flex-direction: column;\n',
    center:   '  justify-content: center;\n  align-items: center;\n',
    wrap:     '  flex-wrap: wrap;\n',
    rounded:  '  border-radius: 999px;\n',
    pointer:  '  cursor: pointer;\n',
    bold:     '  font-weight: bold;\n',
    italic:   '  font-style: italic;\n',
    block:    '  display: block;\n',
    inline:   '  display: inline;\n',
    relative: '  position: relative;\n',
    absolute: '  position: absolute;\n',
    fixed:    '  position: fixed;\n',
    none:     '  display: none;\n',
    nowrap:   '  white-space: nowrap;\n',
    uppercase:'  text-transform: uppercase;\n',
  }

  if (shorthands[key]) return shorthands[key]

  if (value === true) return '' // unknown bare keyword, skip

  var prop = THREAD_ALIASES[key] || key

  // Preset lookup (e.g. shadow: soft)
  if (THREAD_PRESETS[prop] && THREAD_PRESETS[prop][value]) {
    return '  ' + prop + ': ' + THREAD_PRESETS[prop][value] + ';\n'
  }
  if (THREAD_PRESETS[key] && THREAD_PRESETS[key][value]) {
    return '  box-shadow: ' + THREAD_PRESETS[key][value] + ';\n'
  }

  // Numeric: append px to bare numbers
  if (THREAD_NUMERIC.includes(prop)) {
    value = String(value).split(/\s+/).map(function(v) {
      return (!isNaN(v) && v !== '') ? v + 'px' : v
    }).join(' ')
  }

  return '  ' + prop + ': ' + value + ';\n'
}

// ══════════════════════════════════════════════
//   WEAVE JS COMPILER
//   say → console.log
//   put(val, "#sel") → document.querySelector...
//   on("#sel","event",fn) → addEventListener
//   load("url") → await fetch...
//   ping("url") → await fetch HEAD...
//   task → function
//   let/if/else/for/while → pass through
// ══════════════════════════════════════════════

function compileWeaveBlock(source) {
  var lines = source.split('\n')
  var out = []
  var inTask = false

  for (var i = 0; i < lines.length; i++) {
    out.push(compileWeaveLine(lines[i]))
  }

  return out.join('\n')
}

function compileWeaveLine(line) {
  var t = line.trim()

  if (t === '' || t.startsWith('//')) return line

  // task name(args) { → function name(args) {
  if (/^task\s+\w+\s*\(/.test(t)) return line.replace(/\btask\b/, 'function')

  // say(...) → console.log(...)
  if (/\bsay\s*\(/.test(t)) return line.replace(/\bsay\s*\(/g, 'console.log(')

  // put(value, "#sel") → document.querySelector("#sel").textContent = value
  var putM = t.match(/^put\s*\(\s*(.+?)\s*,\s*["'](.+?)["']\s*\)$/)
  if (putM) {
    var indent = line.match(/^(\s*)/)[1]
    return indent + 'document.querySelector("' + putM[2] + '").textContent = ' + putM[1] + ';'
  }

  // on("#sel", "event", handler)
  var onM = t.match(/^on\s*\(\s*["'](.+?)["']\s*,\s*["'](.+?)["']\s*,\s*(.+?)\s*\)$/)
  if (onM) {
    var ind = line.match(/^(\s*)/)[1]
    return ind + 'document.querySelector("' + onM[1] + '").addEventListener("' + onM[2] + '", ' + onM[3] + ');'
  }

  // load("url") → await fetch(url).then(r => r.json())
  if (/\bload\s*\(\s*["']/.test(t)) {
    return line.replace(/\bload\s*\(\s*["'](.+?)["']\s*\)/g, "fetch('$1').then(function(r){ return r.json() })")
  }

  // ping("url") → fetch(url, {method:"HEAD"}).then(r=>r.ok).catch(()=>false)
  if (/\bping\s*\(\s*["']/.test(t)) {
    return line.replace(/\bping\s*\(\s*["'](.+?)["']\s*\)/g, "fetch('$1', { method: 'HEAD' }).then(function(r){ return r.ok }).catch(function(){ return false })")
  }

  return line
}

// ── Page builders ──────────────────────────────

function buildFullPage(title, bodyHTML, css, js) {
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <title>' + esc(title) + '</title>\n' +
    '  <style>\n* { box-sizing: border-box; margin: 0; padding: 0; }\n' + css + '\n  </style>\n' +
    '</head>\n<body>\n  ' + bodyHTML + '\n' +
    '  <script>\n' + js + '\n  <\/script>\n' +
    '</body>\n</html>'
}

function buildJSOnlyPage(js) {
  return '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Weave Output</title>' +
    '<style>body{background:#0a0a0f;color:#6ee7b7;font-family:\'JetBrains Mono\',monospace;padding:24px;font-size:13px;}</style>' +
    '</head>\n<body>\n<pre id="output"></pre>\n<script>\n' +
    '(function(){\n' +
    '  var _log = console.log.bind(console);\n' +
    '  var out = document.getElementById("output");\n' +
    '  console.log = function() { var msg = Array.from(arguments).join(" "); out.textContent += msg + "\\n"; _log.apply(console, arguments); };\n' +
    js + '\n})();\n<\/script>\n</body>\n</html>'
}

function buildThreadPreviewPage(css) {
  return '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Thread Preview</title>' +
    '<style>* { box-sizing: border-box; margin: 0; padding: 0; }\n' + css + '</style>' +
    '</head>\n<body></body>\n</html>'
}

function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

// ── COMPILE + PREVIEW ─────────────────────────

function compileAndPreview() {
  if (!editor) return
  var source = editor.getValue()
  setStatus('loading', 'Compiling…')

  try {
    var compiled = compileWeave(source)
    lastCompiledHTML = compiled
    document.getElementById('preview').srcdoc = compiled
    document.getElementById('outputView').textContent = compiled
    setStatus('ok', 'Compiled')
  } catch (err) {
    setStatus('error', 'Error: ' + err.message)
    console.error('Compile error:', err)
  }
}

function setStatus(type, msg) {
  var dot    = document.getElementById('compileIndicator')
  var text   = document.getElementById('compileStatus')
  var navDot = document.getElementById('statusDot')
  var navTxt = document.getElementById('statusText')
  dot.className    = 'status-indicator' + (type === 'error' ? ' error' : type === 'loading' ? ' loading' : '')
  text.textContent = msg
  navDot.className = 'status-dot' + (type === 'error' ? ' error' : type === 'loading' ? ' loading' : '')
  navTxt.textContent = msg
}

// ── TOOLBAR ───────────────────────────────────

document.getElementById('compileBtn').addEventListener('click', compileAndPreview)
document.getElementById('runBtn').addEventListener('click', compileAndPreview)
document.getElementById('refreshBtn').addEventListener('click', compileAndPreview)

document.getElementById('downloadBtn').addEventListener('click', function () {
  var source = editor ? editor.getValue() : ''
  var blob = new Blob([source], { type: 'text/plain' })
  var a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = document.getElementById('currentFile').textContent || 'app.web'
  a.click()
})

document.getElementById('newWindowBtn').addEventListener('click', function () {
  if (!lastCompiledHTML) return
  var w = window.open('', '_blank')
  w.document.write(lastCompiledHTML)
  w.document.close()
})

// Preview / Output tabs
function showPreview() {
  document.getElementById('preview').style.display    = 'block'
  document.getElementById('outputView').style.display = 'none'
  document.getElementById('previewTab').classList.add('active')
  document.getElementById('outputTab').classList.remove('active')
  showingOutput = false
}
function showOutput() {
  document.getElementById('preview').style.display    = 'none'
  document.getElementById('outputView').style.display = 'block'
  document.getElementById('outputTab').classList.add('active')
  document.getElementById('previewTab').classList.remove('active')
  showingOutput = true
}
document.getElementById('previewTab').addEventListener('click', showPreview)
document.getElementById('outputTab').addEventListener('click', showOutput)

// ── FILE TREE ─────────────────────────────────

document.querySelectorAll('.tree-file').forEach(function (item) {
  item.addEventListener('click', function () {
    document.querySelectorAll('.tree-file').forEach(function(f){ f.classList.remove('active') })
    item.classList.add('active')

    var key  = item.dataset.example
    var name = item.querySelector('span:last-child').textContent
    document.getElementById('currentFile').textContent      = name
    document.getElementById('editorTabLabel').textContent   = name
    document.getElementById('editorBreadcrumb').textContent = name

    if (key && EXAMPLES[key]) {
      if (editor) {
        editor.setValue(EXAMPLES[key])
        compileAndPreview()
      } else {
        var wait = setInterval(function () {
          if (editor) { clearInterval(wait); editor.setValue(EXAMPLES[key]); compileAndPreview() }
        }, 100)
      }
    }
  })
})

document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    compileAndPreview()
  }
})

// ── AI PANEL ──────────────────────────────────

var aiPanel  = document.getElementById('aiPanel')
var aiChat   = document.getElementById('aiChat')
var aiPrompt = document.getElementById('aiPrompt')
var aiSend   = document.getElementById('aiSend')
var sendCtx  = document.getElementById('sendContext')

function toggleAI(open) {
  aiOpen = (open !== undefined) ? open : !aiOpen
  aiPanel.classList.toggle('open', aiOpen)
  document.getElementById('aiToggleLabel').textContent = aiOpen ? 'Close AI' : 'AI'
}

document.getElementById('aiToggle').addEventListener('click', function(){ toggleAI() })
document.getElementById('aiClose').addEventListener('click', function(){ toggleAI(false) })

document.querySelectorAll('.ai-chip').forEach(function (chip) {
  chip.addEventListener('click', function () {
    aiPrompt.value = chip.dataset.prompt
    if (!aiOpen) toggleAI(true)
    aiPrompt.focus()
  })
})

aiPrompt.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAIMessage() }
})
aiSend.addEventListener('click', sendAIMessage)

function appendMessage(role, content, code) {
  var msg    = document.createElement('div')
  var avatar = document.createElement('div')
  var bubble = document.createElement('div')

  msg.className    = 'ai-message ' + (role === 'user' ? 'ai-message-user' : 'ai-message-system')
  avatar.className = 'ai-avatar'
  avatar.textContent = role === 'user' ? 'U' : 'W'
  bubble.className = 'ai-bubble'

  if (code) {
    var pre = document.createElement('pre')
    pre.textContent = code
    var btn = document.createElement('button')
    btn.className   = 'ai-insert-btn'
    btn.textContent = '⊕ Insert into editor'
    btn.addEventListener('click', function () {
      if (editor) { editor.setValue(code); compileAndPreview(); toggleAI(false) }
    })
    var textBefore = content.split(/```[\w]*\n[\s\S]*?```/)[0].trim()
    if (textBefore) {
      var p = document.createElement('p')
      p.style.marginBottom = '8px'
      p.textContent = textBefore
      bubble.appendChild(p)
    }
    bubble.appendChild(pre)
    bubble.appendChild(btn)
  } else {
    bubble.innerHTML = content
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
  }

  msg.appendChild(avatar)
  msg.appendChild(bubble)
  aiChat.appendChild(msg)
  aiChat.scrollTop = aiChat.scrollHeight
}

function appendThinking() {
  var msg    = document.createElement('div')
  var avatar = document.createElement('div')
  var bubble = document.createElement('div')
  msg.className      = 'ai-message ai-message-system'
  msg.id             = 'thinking-msg'
  avatar.className   = 'ai-avatar'
  avatar.textContent = 'W'
  bubble.className   = 'ai-bubble ai-thinking'
  bubble.innerHTML   = '<span>Thinking</span><span class="thinking-dots"><span></span><span></span><span></span></span>'
  msg.appendChild(avatar)
  msg.appendChild(bubble)
  aiChat.appendChild(msg)
  aiChat.scrollTop = aiChat.scrollHeight
  return msg
}

async function sendAIMessage() {
  var prompt = aiPrompt.value.trim()
  if (!prompt) return

  appendMessage('user', prompt)
  aiPrompt.value  = ''
  aiSend.disabled = true

  var fullPrompt = prompt
  if (sendCtx.checked && editor) {
    var code = editor.getValue()
    fullPrompt =
      'You are an expert weave.web developer. weave.web uses .web files for all three languages.\n\n' +
      'LANGUAGE SYSTEM: @import lines at the top of a .web file declare the language mode — like <script type="..."> tags.\n' +
      '  @import HTML body   → chicken-nuget HTML block (page { h1 "text"  button #id "text" })\n' +
      '  @import Thread style → Thread CSS block (style { selector { bg: blue  pad: 20  flex  center } })\n' +
      '  @import JS ff        → Weave JS block (script { say()  put()  on()  load()  ping()  task })\n\n' +
      'WEAVE builtins: say(val)  put(val, "#sel")  on("#sel","event",fn)  load("url")  ping("url")  task name(args){}\n' +
      'THREAD aliases: bg=background  text=color  pad=padding  radius=border-radius  size=font-size  weight=font-weight\n' +
      'THREAD shorthands: flex  row  column  center  wrap  rounded  pointer  bold  italic  uppercase\n' +
      'THREAD presets: shadow: soft | hard\n' +
      'HTML elements: h1-h6 #id "text"  p #id "text"  button #id "text"  input #id "placeholder"  a #id "text" href="url"\n\n' +
      'Current editor code:\n```\n' + code + '\n```\n\n' +
      'User request: ' + prompt + '\n\n' +
      'If generating code, wrap it in a single ```weave code block.'
  }

  var thinking = appendThinking()

  try {
    var resp = await fetch(AI_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: fullPrompt })
    })
    var raw = await resp.text()
    var data = {}
    try { data = JSON.parse(raw) } catch(e) { throw new Error(raw) }
    if (!resp.ok) throw new Error(data.error || 'HTTP ' + resp.status)

    var result = data.result || data.content || ''
    if (!result) throw new Error('AI returned no result.')

    thinking.remove()

    var codeMatch = result.match(/```(?:weave|web)?\n([\s\S]*?)```/)
    if (codeMatch) appendMessage('assistant', result, codeMatch[1].trim())
    else appendMessage('assistant', result)

  } catch (err) {
    thinking.remove()
    appendMessage('assistant', '⚠️ Error: ' + err.message)
  } finally {
    aiSend.disabled = false
  }
}
