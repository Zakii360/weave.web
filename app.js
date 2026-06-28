/* =============================================
   WEAVE.WEB — APP.JS v2
   Same reliable compiler as v1, plus:
   • show/hide/html() in Weave
   • Nested HTML blocks in chicken-nuget
   • A few extra Thread shorthands (glass, sticky, ellipsis)
   • CSS variables (--name: value)
   • shadow: glow|lifted presets
   • AI uses OpenRouter first, Groq as fallback
============================================= */

const AI_ENDPOINT = "https://tvxugmumfvgnvjacwwfz.supabase.co/functions/v1/GROQAI"

// ── EXAMPLES ──────────────────────────────────

const EXAMPLES = {
  main: `@import HTML body
@import Thread style
@import JS ff

page Home {

    div #hero {
        h1 "Hello from weave.web"
        p "Build HTML, CSS, and JS in one .web file"
        button #btn "Click Me"
    }
}

style {

    body {
        bg: #0f172a
        text: white
        pad: 40
        font-family: Arial
    }

    #hero {
        flex
        column
        center
        gap: 20
        min-height: 60vh
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
        put("It works! 🎉", "#btn")
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
// say, put, on, load, ping, task, let, show, hide, html

let name = "weave.web"

say("Hello from " + name)

task greet(person) {
    return "Hey, " + person + "!"
}

say(greet(name))`,

  thread: `@import Thread style

// Thread — CSS with aliases and shorthand

body {

    bg: #0a0a0f
    text: white
    pad: 40
    font-family: Arial
    flex
    column
    center
    min-height: 100vh
    gap: 24
}

h1 {
    text: #6ee7b7
    size: 40
    weight: bold
}

.card {
    bg: #1a1a2a
    pad: 32
    radius: 16
    shadow: soft
    w: 300
}

button {
    bg: royalblue
    text: white
    border: none
    pad: 14 24
    radius: 12
    pointer
    shadow: lifted
}`,

  hybrid: `@import HTML body
@import Thread style
@import JS ff

// Full hybrid — all three languages in one .web file

page Dashboard {

    div #app {
        h1 #score "Score: 0"
        p "Click the button to score points"
        button #btn "Score!"
        h2 #msg ""
    }
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

    #app {
        flex
        column
        center
        gap: 20
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

  monaco.languages.setMonarchTokensProvider('weave', {
    tokenizer: {
      root: [
        [/@[a-z]+\b.*$/,                                              'keyword.directive'],
        [/\/\/.*/,                                                    'comment'],
        [/\b(page|style|script)\b/,                                   'keyword.block'],
        [/\b(task|let|const|return|if|else|for|while)\b/,            'keyword.control'],
        [/\b(say|put|on|load|ping|show|hide|html)\b/,                 'keyword.builtin'],
        [/\b(h[1-6]|p|div|span|button|input|a|section|nav|header|footer|main|ul|li|img|hr|br)\b/, 'tag'],
        [/\b(flex|row|column|center|wrap|rounded|pointer|bold|italic|block|none|sticky|glass|ellipsis|uppercase|relative|absolute|fixed)\b/, 'keyword.shorthand'],
        [/\b(bg|text|pad|radius|size|weight|shadow|margin|gap|border|w|h|align|opacity|transition)\b/, 'keyword.alias'],
        [/--[\w-]+/,                                                  'variable'],
        [/"[^"]*"/,                                                   'string'],
        [/'[^']*'/,                                                   'string'],
        [/#[\w-]+/,                                                   'type'],
        [/\.[\w-]+/,                                                  'tag'],
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
      { token: 'variable',          foreground: 'f472b6' },
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
// ══════════════════════════════════════════════

function compileWeave(source) {

  var imports = {}
  var importRe = /^@[a-z]+\s+(\w+)\s+(\w+)/gim
  var m
  while ((m = importRe.exec(source)) !== null) {
    imports[m[1]] = m[2]
  }

  var hasHTML   = !!imports.HTML
  var hasThread = !!imports.Thread
  var hasJS     = !!imports.JS

  var body = source.replace(/^@[a-z]+\s+\w+\s+\w+\s*$/gim, '').trim()

  var title    = 'weave.web'
  var bodyHTML = ''
  var cssOut   = ''
  var jsOut    = ''

  // ── HTML / chicken-nuget ──────────────────────────────
  if (hasHTML) {
    var pageM = body.match(/page(?:\s+\w+)?\s*\{([\s\S]*?)\n\}/)
    if (pageM) {
      var pageContent = pageM[1]
      var titleM = pageContent.match(/title\s+"([^"]+)"/)
      if (titleM) title = titleM[1]
      bodyHTML = compileHTMLBlock(pageContent)
    }
  }

  // ── Thread CSS ────────────────────────────────────────
  if (hasThread) {
    var styleBlock = extractBlock(body, /\bstyle(?:\s+\w+)?\s*\{/)
    if (styleBlock !== null) {
      cssOut = compileThreadBlock(styleBlock)
    }
  }

  // ── Weave JS ──────────────────────────────────────────
  if (hasJS) {
    var scriptBlock = extractBlock(body, /\bscript\s*\{/)
    if (scriptBlock !== null) {
      jsOut = compileWeaveBlock(scriptBlock)
    }
  }

  // Pure Weave
  if (!hasHTML && !hasThread && hasJS) {
    jsOut = compileWeaveBlock(body)
    return buildJSOnlyPage(jsOut)
  }

  // Pure Thread
  if (!hasHTML && hasThread && !hasJS) {
    cssOut = compileThreadBlock(body)
    return buildThreadPreviewPage(cssOut)
  }

  return buildFullPage(title, bodyHTML, cssOut, jsOut)
}

// ── Block extractor ──────────────────────────────────────

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
//   Now supports nested blocks:
//     div #id { h1 "text"  p "text" }
//   As well as the original flat inline elements
// ══════════════════════════════════════════════

function compileHTMLBlock(content) {
  return parseHTMLLines(content)
}

function parseHTMLLines(content) {
  var html = ''
  var lines = content.split('\n')
  var i = 0

  while (i < lines.length) {
    var line = lines[i].trim()

    if (!line || line.startsWith('title ') || line.startsWith('//')) {
      i++
      continue
    }

    // Check if this line opens a nested block (ends with {)
    if (line.endsWith('{')) {
      var tagLine = line.slice(0, -1).trim()
      var tagInfo = parseTagInfo(tagLine)

      if (tagInfo) {
        // Collect lines until the matching }
        var depth = 1
        var innerLines = []
        i++
        while (i < lines.length && depth > 0) {
          var innerLine = lines[i]
          var trimmed = innerLine.trim()
          if (trimmed.endsWith('{')) depth++
          if (trimmed === '}') depth--
          if (depth > 0) innerLines.push(innerLine)
          i++
        }
        var innerHTML = parseHTMLLines(innerLines.join('\n'))
        html += '<' + tagInfo.tag + tagInfo.attrs + '>\n' + innerHTML + '</' + tagInfo.tag + '>\n'
        continue
      }
    }

    // Flat inline element
    html += parseHTMLElement(line)
    i++
  }

  return html
}

// Parse "div #id .class" or "button #btn" into { tag, attrs }
function parseTagInfo(line) {
  // Block-level containers that can have children
  var blockTags = ['div','section','header','footer','nav','main','article','aside','ul','ol','form','figure']

  var tagMatch = line.match(/^([\w-]+)/)
  if (!tagMatch) return null
  var tag = tagMatch[1]
  if (!blockTags.includes(tag)) return null

  var attrs = ''
  var idM  = line.match(/#([\w-]+)/)
  var clsM = line.match(/\.([\w-]+)/g)
  if (idM)  attrs += ' id="' + idM[1] + '"'
  if (clsM) attrs += ' class="' + clsM.map(function(c){ return c.slice(1) }).join(' ') + '"'

  return { tag: tag, attrs: attrs }
}

function parseHTMLElement(line) {

  // h1–h6 [#id] "text"
  var hm = line.match(/^(h[1-6])(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (hm) return '<' + hm[1] + (hm[2] ? ' id="' + hm[2] + '"' : '') + '>' + esc(hm[3]) + '</' + hm[1] + '>\n'

  // p [#id] "text"
  var pm = line.match(/^p(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (pm) return '<p' + (pm[1] ? ' id="' + pm[1] + '"' : '') + '>' + esc(pm[2]) + '</p>\n'

  // button [#id] "text"
  var bm = line.match(/^button(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (bm) return '<button' + (bm[1] ? ' id="' + bm[1] + '"' : '') + '>' + esc(bm[2]) + '</button>\n'

  // input [#id] "placeholder"
  var im = line.match(/^input(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (im) return '<input' + (im[1] ? ' id="' + im[1] + '"' : '') + ' placeholder="' + esc(im[2]) + '" />\n'

  // img src="url" alt="text"
  var imgm = line.match(/^img\s+src="([^"]+)"(?:\s+alt="([^"]*)")?$/)
  if (imgm) return '<img src="' + imgm[1] + '" alt="' + esc(imgm[2] || '') + '" />\n'

  // a [#id] "text" [href="url"]
  var am = line.match(/^a(?:\s+#([\w-]+))?\s+"([^"]+)"(?:\s+href="([^"]+)")?$/)
  if (am) return '<a' + (am[1] ? ' id="' + am[1] + '"' : '') + (am[3] ? ' href="' + am[3] + '"' : '') + '>' + esc(am[2]) + '</a>\n'

  // span [#id] "text"
  var sm = line.match(/^span(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (sm) return '<span' + (sm[1] ? ' id="' + sm[1] + '"' : '') + '>' + esc(sm[2]) + '</span>\n'

  // li "text"
  var lim = line.match(/^li\s+"([^"]+)"$/)
  if (lim) return '<li>' + esc(lim[1]) + '</li>\n'

  // hr  br  (void, no content)
  if (line === 'hr') return '<hr>\n'
  if (line === 'br') return '<br>\n'

  return ''
}

// ══════════════════════════════════════════════
//   THREAD CSS COMPILER
//   Original logic kept intact.
//   Added: CSS variables, glass, sticky, ellipsis,
//   shadow: glow|lifted|card, border auto-px
// ══════════════════════════════════════════════

var THREAD_ALIASES = {
  bg: 'background', text: 'color', radius: 'border-radius',
  size: 'font-size', weight: 'font-weight', pad: 'padding',
  margin: 'margin', w: 'width', h: 'height', align: 'text-align',
  gap: 'gap', border: 'border', opacity: 'opacity',
  transition: 'transition', z: 'z-index'
}

var THREAD_PRESETS = {
  shadow: {
    soft:   '0 4px 12px rgba(0,0,0,0.15)',
    hard:   '0 8px 24px rgba(0,0,0,0.35)',
    glow:   '0 0 20px rgba(110,231,183,0.35)',
    lifted: '0 8px 30px rgba(0,0,0,0.3)',
    card:   '0 2px 8px rgba(0,0,0,0.2)'
  },
  transition: {
    fast:   'all 0.15s ease',
    smooth: 'all 0.3s ease',
    slow:   'all 0.6s ease',
    bounce: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
}

var THREAD_NUMERIC = [
  'padding','margin','border-radius','font-size','width','height',
  'gap','min-height','max-width','line-height','letter-spacing',
  'top','left','right','bottom','min-width','z-index'
]

function compileThreadBlock(source) {
  // Pull out CSS variables first, emit as :root {}
  var cssVars = ''
  var cleaned = source.replace(/--[\w-]+\s*:[^\n]+/g, function(match) {
    cssVars += '  ' + match.trim() + ';\n'
    return ''
  })
  var rootBlock = cssVars ? ':root {\n' + cssVars + '}\n\n' : ''

  var ast = parseThreadAST(cleaned)
  var css = rootBlock
  for (var i = 0; i < ast.length; i++) {
    css += renderThreadRule(ast[i], '')
  }
  return css
}

function parseThreadAST(source) {
  var lines = source.split('\n')
    .map(function(l){ return l.trim() })
    .filter(function(l){ return l && !l.startsWith('//') })
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
      stack[stack.length - 1].properties.push({
        key: line.slice(0, colon).trim(),
        value: line.slice(colon + 1).trim()
      })
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
  var shorthands = {
    flex:      '  display: flex;\n',
    row:       '  flex-direction: row;\n',
    column:    '  flex-direction: column;\n',
    center:    '  justify-content: center;\n  align-items: center;\n',
    wrap:      '  flex-wrap: wrap;\n',
    rounded:   '  border-radius: 999px;\n',
    pointer:   '  cursor: pointer;\n',
    bold:      '  font-weight: bold;\n',
    italic:    '  font-style: italic;\n',
    block:     '  display: block;\n',
    inline:    '  display: inline;\n',
    relative:  '  position: relative;\n',
    absolute:  '  position: absolute;\n',
    fixed:     '  position: fixed;\n',
    sticky:    '  position: sticky;\n',
    none:      '  display: none;\n',
    hidden:    '  display: none;\n',
    nowrap:    '  white-space: nowrap;\n',
    uppercase: '  text-transform: uppercase;\n',
    ellipsis:  '  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n',
    glass:     '  background: rgba(255,255,255,0.05);\n  backdrop-filter: blur(14px);\n  -webkit-backdrop-filter: blur(14px);\n  border: 1px solid rgba(255,255,255,0.1);\n',
    grid:      '  display: grid;\n',
  }

  if (shorthands[key]) return shorthands[key]
  if (value === true)  return ''   // unknown bare keyword, skip

  var prop = THREAD_ALIASES[key] || key

  // shadow preset
  if (key === 'shadow' && THREAD_PRESETS.shadow[value]) {
    return '  box-shadow: ' + THREAD_PRESETS.shadow[value] + ';\n'
  }

  // transition preset
  if (key === 'transition' && THREAD_PRESETS.transition[value]) {
    return '  transition: ' + THREAD_PRESETS.transition[value] + ';\n'
  }

  // border: 2 solid #333  →  border: 2px solid #333
  if ((key === 'border') && value) {
    var parts = String(value).split(/\s+/)
    if (!isNaN(parts[0]) && parts[0] !== '') parts[0] = parts[0] + 'px'
    return '  border: ' + parts.join(' ') + ';\n'
  }

  // Numeric: append px to bare numbers
  if (THREAD_NUMERIC.includes(prop) && value !== undefined) {
    value = String(value).split(/\s+/).map(function(v) {
      return (!isNaN(v) && v !== '') ? v + 'px' : v
    }).join(' ')
  }

  return '  ' + prop + ': ' + value + ';\n'
}

// ══════════════════════════════════════════════
//   WEAVE JS COMPILER
//   Original logic kept intact.
//   Added: show(), hide(), html()
// ══════════════════════════════════════════════

function compileWeaveBlock(source) {
  var lines = source.split('\n')
  var out = []
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

  // show("#sel") → document.querySelector("#sel").style.display = ""
  var showM = t.match(/^show\s*\(\s*["'](.+?)['"]\s*\)$/)
  if (showM) {
    var ind = line.match(/^(\s*)/)[1]
    return ind + 'document.querySelector("' + showM[1] + '").style.display = "";'
  }

  // hide("#sel") → ...style.display = "none"
  var hideM = t.match(/^hide\s*\(\s*["'](.+?)['"]\s*\)$/)
  if (hideM) {
    var ind2 = line.match(/^(\s*)/)[1]
    return ind2 + 'document.querySelector("' + hideM[1] + '").style.display = "none";'
  }

  // html("#sel", "markup") → ...innerHTML = "markup"
  var htmlM = t.match(/^html\s*\(\s*["'](.+?)['"]\s*,\s*([\s\S]+?)\s*\)$/)
  if (htmlM) {
    var ind3 = line.match(/^(\s*)/)[1]
    return ind3 + 'document.querySelector("' + htmlM[1] + '").innerHTML = ' + htmlM[2] + ';'
  }

  // put(value, "#sel") → document.querySelector("#sel").textContent = value
  var putM = t.match(/^put\s*\(\s*(.+?)\s*,\s*["'](.+?)['"]\s*\)$/)
  if (putM) {
    var indent = line.match(/^(\s*)/)[1]
    return indent + 'document.querySelector("' + putM[2] + '").textContent = ' + putM[1] + ';'
  }

  // on("#sel", "event", handler)
  var onM = t.match(/^on\s*\(\s*["'](.+?)['"]\s*,\s*["'](.+?)['"]\s*,\s*(.+?)\s*\)$/)
  if (onM) {
    var ind4 = line.match(/^(\s*)/)[1]
    return ind4 + 'document.querySelector("' + onM[1] + '").addEventListener("' + onM[2] + '", ' + onM[3] + ');'
  }

  // load("url") → fetch(url).then(r => r.json())
  if (/\bload\s*\(\s*["']/.test(t)) {
    return line.replace(/\bload\s*\(\s*["'](.+?)['"]\s*\)/g, "fetch('$1').then(function(r){ return r.json() })")
  }

  // ping("url") → fetch HEAD
  if (/\bping\s*\(\s*["']/.test(t)) {
    return line.replace(/\bping\s*\(\s*["'](.+?)['"]\s*\)/g, "fetch('$1', { method: 'HEAD' }).then(function(r){ return r.ok }).catch(function(){ return false })")
  }

  return line
}

// ── Page builders ──────────────────────────────

function buildFullPage(title, bodyHTML, css, js) {
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <title>' + esc(title) + '</title>\n' +
    '  <style>\n* { box-sizing: border-box; margin: 0; padding: 0; }\n' + css + '\n  </style>\n' +
    '</head>\n<body>\n' + bodyHTML + '\n' +
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

// ══════════════════════════════════════════════
//   AI PANEL
// ══════════════════════════════════════════════

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

// The system prompt tells the AI exactly how weave.web works
// in plain, human language — so it generates correct code every time
function buildSystemPrompt(code) {
  return `You are a weave.web coding assistant. weave.web is a simple language that compiles to HTML/CSS/JS.

A .web file starts with @import lines, then has blocks:

@import HTML body     ← enables the page {} HTML block
@import Thread style  ← enables the style {} CSS block  
@import JS ff         ← enables the script {} JS block

━━ chicken-nuget (HTML) ━━
Written inside  page Name { }

Elements are just: tagname optional-#id "text"
  h1 "Big title"
  h2 #subtitle "Smaller"
  p "A paragraph"
  p #intro "Paragraph with an id"
  button #btn "Click me"
  input #name "Placeholder text"
  a "Link text" href="https://example.com"
  span #badge "Badge"
  img src="https://picsum.photos/400" alt="Photo"
  hr
  br
  li "List item"

You can also nest elements inside a block container:
  div #hero {
      h1 "Title"
      p "Subtitle"
      button #cta "Get started"
  }

Block containers: div, section, header, footer, nav, main, article, ul, ol, form

━━ Thread (CSS) ━━
Written inside  style { }

Selector blocks work exactly like CSS, with these shortcuts:
  bg: #color           → background
  text: #color         → color
  pad: 20              → padding: 20px  (numbers auto-get px)
  pad: 20 40           → padding: 20px 40px
  radius: 12           → border-radius: 12px
  size: 18             → font-size: 18px
  weight: bold         → font-weight: bold
  w: 300               → width: 300px
  h: 100               → height: 100px
  gap: 16              → gap: 16px
  align: center        → text-align: center
  border: 2 solid #333 → border: 2px solid #333
  opacity: 0.8         → opacity: 0.8
  transition: smooth   → transition: all 0.3s ease

One-word shorthands (no value needed):
  flex      → display: flex
  column    → flex-direction: column
  row       → flex-direction: row
  center    → justify-content: center + align-items: center
  wrap      → flex-wrap: wrap
  rounded   → border-radius: 999px
  pointer   → cursor: pointer
  bold      → font-weight: bold
  italic    → font-style: italic
  uppercase → text-transform: uppercase
  hidden    → display: none
  sticky    → position: sticky
  relative  → position: relative
  absolute  → position: absolute
  fixed     → position: fixed
  ellipsis  → overflow: hidden + text-overflow: ellipsis
  glass     → frosted glass effect

Shadow presets:
  shadow: soft    → subtle drop shadow
  shadow: hard    → stronger shadow
  shadow: lifted  → elevated card look
  shadow: glow    → green glow effect
  shadow: card    → card shadow

Transition presets:
  transition: fast    → 0.15s ease
  transition: smooth  → 0.3s ease
  transition: bounce  → springy effect

CSS variables (put at top of style block):
  --primary: #6ee7b7
  Then use: text: var(--primary)

Nesting works:
  .card {
      bg: #1a1a2a
      pad: 24
      
      h3 {
          text: #6ee7b7
      }
  }

━━ Weave (JS) ━━
Written inside  script { }

  say("hello")              → console.log
  put("new text", "#sel")   → sets element text
  html("#sel", "markup")    → sets element innerHTML
  on("#btn", "click", fn)   → adds event listener
  show("#sel")              → makes element visible
  hide("#sel")              → hides element
  task name() { }           → defines a function
  let x = 5                 → variable
  load("url")               → fetch JSON from URL
  ping("url")               → check if URL is alive

Everything else (if, for, while, return, etc.) works as normal JavaScript.

━━ RULES ━━
1. Always use the matching @import lines at the top
2. HTML goes in page { }, CSS in style { }, JS in script { }
3. Use #id to target elements from JS: on("#btn", "click", fn)
4. Numbers in Thread auto-get px — just write the number
5. Wrap code in a single \`\`\`weave code block

Current code in editor:
\`\`\`
${code}
\`\`\`

If the user asks for code, generate a complete .web file. Keep it simple and readable.`
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
    fullPrompt = buildSystemPrompt(code) + '\n\nUser: ' + prompt + '\n\nIf generating code, wrap it in a single ```weave code block.'
  } else {
    fullPrompt = buildSystemPrompt('(no editor context)') + '\n\nUser: ' + prompt + '\n\nIf generating code, wrap it in a single ```weave code block.'
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
