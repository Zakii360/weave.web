/* =============================================
   WEAVE.WEB — APP.JS v2
   Same reliable compiler as v1, plus:
   - show/hide/html() in Weave
   - Nested HTML blocks in chicken-nuget
   - Extra Thread shorthands (glass, sticky, ellipsis)
   - CSS variables (--name: value → :root {})
   - shadow: glow|lifted presets
   - AI uses OpenRouter first, Groq as fallback
============================================= */

const AI_ENDPOINT = "https://tvxugmumfvgnvjacwwfz.supabase.co/functions/v1/GROQAI"

const EXAMPLES = {
  main: `@import HTML body
@import Thread style
@import JS ff

page Home {

    div #hero {
        h1 "Hello from weave.web"
        p "Build HTML, CSS, and JS in one file"
        button #btn "Click Me"
    }
}

style {

    body {
        bg: #0f172a
        text: white
        pad: 40
        font-family: Arial
        flex
        column
        center
        min-height: 100vh
    }

    #hero {
        flex
        column
        center
        gap: 20
        text-align: center
    }

    h1 {
        text: #6ee7b7
        size: 32
    }

    p {
        text: #94a3b8
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
// say, put, on, load, ping, task, show, hide, html

let name = "weave.web"

say("Hello from " + name)

task greet(person) {
    return "Hey, " + person + "!"
}

say(greet(name))`,

  thread: `@import Thread style

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
    }

    p {
        text: #94a3b8
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
        put("Score: " + score, "#score")
        if (score >= 10) {
            put("You win! 🎉", "#msg")
        }
    }
}`
}

var editor = null
var lastCompiledHTML = ''
var showingOutput = false
var aiOpen = false

require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' } })

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
        [/\b(h[1-6]|p|div|span|button|input|a|section|nav|header|footer|main|ul|ol|li|img|hr|br)\b/, 'tag'],
        [/\b(flex|row|column|center|wrap|rounded|pointer|bold|italic|block|none|sticky|glass|ellipsis|uppercase|relative|absolute|fixed|hidden|grid)\b/, 'keyword.shorthand'],
        [/\b(bg|text|pad|radius|size|weight|shadow|margin|gap|border|w|h|align|opacity|transition|z)\b/, 'keyword.alias'],
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
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'keyword.directive', foreground: '818cf8', fontStyle: 'italic' },
      { token: 'keyword.block',     foreground: 'c084fc', fontStyle: 'bold'   },
      { token: 'keyword.control',   foreground: '818cf8'                       },
      { token: 'keyword.builtin',   foreground: '38bdf8'                       },
      { token: 'keyword.shorthand', foreground: 'fb923c'                       },
      { token: 'keyword.alias',     foreground: 'fbbf24'                       },
      { token: 'tag',               foreground: '6ee7b7'                       },
      { token: 'variable',          foreground: 'f472b6'                       },
      { token: 'string',            foreground: 'a3e635'                       },
      { token: 'type',              foreground: '38bdf8'                       },
      { token: 'number',            foreground: 'fb923c'                       },
      { token: 'comment',           foreground: '3f3f5a', fontStyle: 'italic'  },
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

  editor = monaco.editor.create(document.getElementById('editor'), {
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
  })

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
//  COMPILER
// ══════════════════════════════════════════════

function compileWeave(source) {
  var imports = {}
  var importRe = /^@[a-z]+\s+(\w+)\s+(\w+)/gim
  var m
  while ((m = importRe.exec(source)) !== null) imports[m[1]] = m[2]

  var hasHTML   = !!imports.HTML
  var hasThread = !!imports.Thread
  var hasJS     = !!imports.JS

  var body = source.replace(/^@[a-z]+\s+\w+\s+\w+\s*$/gim, '').trim()

  var title = 'weave.web', bodyHTML = '', cssOut = '', jsOut = ''

  if (hasHTML) {
    var pageM = body.match(/page(?:\s+\w+)?\s*\{([\s\S]*?)\n\}/)
    if (pageM) {
      var pc = pageM[1]
      var titleM = pc.match(/title\s+"([^"]+)"/)
      if (titleM) title = titleM[1]
      bodyHTML = compileHTMLBlock(pc)
    }
  }

  if (hasThread) {
    var styleBlock = extractBlock(body, /\bstyle(?:\s+\w+)?\s*\{/)
    if (styleBlock !== null) cssOut = compileThreadBlock(styleBlock)
  }

  if (hasJS) {
    var scriptBlock = extractBlock(body, /\bscript\s*\{/)
    if (scriptBlock !== null) jsOut = compileWeaveBlock(scriptBlock)
  }

  if (!hasHTML && !hasThread && hasJS) return buildJSOnlyPage(compileWeaveBlock(body))
  if (!hasHTML && hasThread && !hasJS) return buildThreadPreviewPage(compileThreadBlock(body))

  return buildFullPage(title, bodyHTML, cssOut, jsOut)
}

function extractBlock(source, pattern) {
  var m = pattern.exec(source)
  if (!m) return null
  var start = source.indexOf('{', m.index + m[0].length - 1)
  if (start === -1) return null
  var depth = 0, i = start
  while (i < source.length) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') { depth--; if (depth === 0) return source.slice(start + 1, i) }
    i++
  }
  return null
}

// ── chicken-nuget ─────────────────────────────
// Supports flat elements AND nested div/section/etc blocks

function compileHTMLBlock(content) {
  return parseHTMLLines(content.split('\n'))
}

function parseHTMLLines(lines) {
  var html = ''
  var i = 0
  while (i < lines.length) {
    var line = lines[i].trim()
    if (!line || line.startsWith('title ') || line.startsWith('//')) { i++; continue }

    // Nested block: line ends with {
    if (line.endsWith('{')) {
      var tagLine = line.slice(0, -1).trim()
      var ti = parseTagInfo(tagLine)
      if (ti) {
        var depth = 1, inner = []
        i++
        while (i < lines.length && depth > 0) {
          var tl = lines[i].trim()
          if (tl.endsWith('{')) depth++
          if (tl === '}') depth--
          if (depth > 0) inner.push(lines[i])
          i++
        }
        html += '<' + ti.tag + ti.attrs + '>\n' + parseHTMLLines(inner) + '</' + ti.tag + '>\n'
        continue
      }
    }

    html += parseHTMLElement(line)
    i++
  }
  return html
}

function parseTagInfo(line) {
  var blockTags = ['div','section','header','footer','nav','main','article','aside','ul','ol','form','figure']
  var tm = line.match(/^([\w-]+)/)
  if (!tm || !blockTags.includes(tm[1])) return null
  var tag = tm[1], attrs = ''
  var idM  = line.match(/#([\w-]+)/)
  var clsM = line.match(/\.([\w-]+)/g)
  if (idM)  attrs += ' id="' + idM[1] + '"'
  if (clsM) attrs += ' class="' + clsM.map(function(c){ return c.slice(1) }).join(' ') + '"'
  return { tag: tag, attrs: attrs }
}

function parseHTMLElement(line) {
  var hm = line.match(/^(h[1-6])(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (hm) return '<' + hm[1] + (hm[2] ? ' id="' + hm[2] + '"' : '') + '>' + esc(hm[3]) + '</' + hm[1] + '>\n'

  var pm = line.match(/^p(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (pm) return '<p' + (pm[1] ? ' id="' + pm[1] + '"' : '') + '>' + esc(pm[2]) + '</p>\n'

  var bm = line.match(/^button(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (bm) return '<button' + (bm[1] ? ' id="' + bm[1] + '"' : '') + '>' + esc(bm[2]) + '</button>\n'

  var im = line.match(/^input(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (im) return '<input' + (im[1] ? ' id="' + im[1] + '"' : '') + ' placeholder="' + esc(im[2]) + '" />\n'

  var imgm = line.match(/^img\s+src="([^"]+)"(?:\s+alt="([^"]*)")?$/)
  if (imgm) return '<img src="' + imgm[1] + '" alt="' + esc(imgm[2] || '') + '" />\n'

  var am = line.match(/^a(?:\s+#([\w-]+))?\s+"([^"]+)"(?:\s+href="([^"]+)")?$/)
  if (am) return '<a' + (am[1] ? ' id="' + am[1] + '"' : '') + (am[3] ? ' href="' + am[3] + '"' : '') + '>' + esc(am[2]) + '</a>\n'

  var sm = line.match(/^span(?:\s+#([\w-]+))?\s+"([^"]+)"$/)
  if (sm) return '<span' + (sm[1] ? ' id="' + sm[1] + '"' : '') + '>' + esc(sm[2]) + '</span>\n'

  var lim = line.match(/^li\s+"([^"]+)"$/)
  if (lim) return '<li>' + esc(lim[1]) + '</li>\n'

  if (line === 'hr') return '<hr>\n'
  if (line === 'br') return '<br>\n'

  return ''
}

// ── Thread CSS ────────────────────────────────

var THREAD_ALIASES = {
  bg:'background', text:'color', radius:'border-radius', size:'font-size',
  weight:'font-weight', pad:'padding', margin:'margin', w:'width', h:'height',
  align:'text-align', gap:'gap', border:'border', opacity:'opacity',
  transition:'transition', z:'z-index'
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
  // Hoist CSS variables into :root {}
  var cssVars = ''
  var cleaned = source.replace(/--[\w-]+\s*:[^\n]+/g, function(match) {
    cssVars += '  ' + match.trim() + ';\n'
    return ''
  })
  var rootBlock = cssVars ? ':root {\n' + cssVars + '}\n\n' : ''
  var ast = parseThreadAST(cleaned)
  var css = rootBlock
  for (var i = 0; i < ast.length; i++) css += renderThreadRule(ast[i], '')
  return css
}

function parseThreadAST(source) {
  var lines = source.split('\n').map(function(l){ return l.trim() }).filter(function(l){ return l && !l.startsWith('//') })
  var ast = [], stack = []
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (line.endsWith('{')) {
      var node = { selector: line.slice(0,-1).trim(), properties: [], children: [] }
      if (stack.length === 0) ast.push(node)
      else stack[stack.length-1].children.push(node)
      stack.push(node)
    } else if (line === '}') {
      stack.pop()
    } else if (stack.length > 0) {
      var colon = line.indexOf(':')
      if (colon > 0) stack[stack.length-1].properties.push({ key: line.slice(0,colon).trim(), value: line.slice(colon+1).trim() })
      else           stack[stack.length-1].properties.push({ key: line, value: true })
    }
  }
  return ast
}

function renderThreadRule(rule, parent) {
  var selector = parent ? parent + ' ' + rule.selector : rule.selector
  var css = selector + ' {\n'
  for (var i = 0; i < rule.properties.length; i++) {
    css += renderThreadProperty(rule.properties[i].key, rule.properties[i].value)
  }
  css += '}\n\n'
  for (var j = 0; j < rule.children.length; j++) css += renderThreadRule(rule.children[j], selector)
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
  if (value === true)  return ''

  var prop = THREAD_ALIASES[key] || key

  if (key === 'shadow' && THREAD_PRESETS.shadow[value])
    return '  box-shadow: ' + THREAD_PRESETS.shadow[value] + ';\n'

  if (key === 'transition' && THREAD_PRESETS.transition[value])
    return '  transition: ' + THREAD_PRESETS.transition[value] + ';\n'

  // border: 2 solid #333 → border: 2px solid #333
  if (key === 'border' && value) {
    var parts = String(value).split(/\s+/)
    if (parts.length > 1 && !isNaN(parts[0])) parts[0] = parts[0] + 'px'
    return '  border: ' + parts.join(' ') + ';\n'
  }

  if (THREAD_NUMERIC.includes(prop) && value !== undefined) {
    value = String(value).split(/\s+/).map(function(v) {
      return (!isNaN(v) && v !== '') ? v + 'px' : v
    }).join(' ')
  }

  return '  ' + prop + ': ' + value + ';\n'
}

// ── Weave JS ──────────────────────────────────

function compileWeaveBlock(source) {
  return source.split('\n').map(compileWeaveLine).join('\n')
}

function compileWeaveLine(line) {
  var t = line.trim()
  if (t === '' || t.startsWith('//')) return line

  if (/^task\s+\w+\s*\(/.test(t)) return line.replace(/\btask\b/, 'function')
  if (/\bsay\s*\(/.test(t))       return line.replace(/\bsay\s*\(/g, 'console.log(')

  var showM = t.match(/^show\s*\(\s*["'](.+?)['"]\s*\)$/)
  if (showM) return line.match(/^(\s*)/)[1] + 'document.querySelector("' + showM[1] + '").style.display = "";'

  var hideM = t.match(/^hide\s*\(\s*["'](.+?)['"]\s*\)$/)
  if (hideM) return line.match(/^(\s*)/)[1] + 'document.querySelector("' + hideM[1] + '").style.display = "none";'

  var htmlM = t.match(/^html\s*\(\s*["'](.+?)['"]\s*,\s*([\s\S]+?)\s*\)$/)
  if (htmlM) return line.match(/^(\s*)/)[1] + 'document.querySelector("' + htmlM[1] + '").innerHTML = ' + htmlM[2] + ';'

  var putM = t.match(/^put\s*\(\s*(.+?)\s*,\s*["'](.+?)['"]\s*\)$/)
  if (putM) return line.match(/^(\s*)/)[1] + 'document.querySelector("' + putM[2] + '").textContent = ' + putM[1] + ';'

  var onM = t.match(/^on\s*\(\s*["'](.+?)['"]\s*,\s*["'](.+?)['"]\s*,\s*(.+?)\s*\)$/)
  if (onM) return line.match(/^(\s*)/)[1] + 'document.querySelector("' + onM[1] + '").addEventListener("' + onM[2] + '", ' + onM[3] + ');'

  if (/\bload\s*\(\s*["']/.test(t))
    return line.replace(/\bload\s*\(\s*["'](.+?)['"]\s*\)/g, "fetch('$1').then(function(r){ return r.json() })")

  if (/\bping\s*\(\s*["']/.test(t))
    return line.replace(/\bping\s*\(\s*["'](.+?)['"]\s*\)/g, "fetch('$1', { method: 'HEAD' }).then(function(r){ return r.ok }).catch(function(){ return false })")

  return line
}

// ── Page builders ─────────────────────────────

function buildFullPage(title, bodyHTML, css, js) {
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>' + esc(title) + '</title>\n' +
    '  <style>\n* { box-sizing: border-box; margin: 0; padding: 0; }\n' + css + '\n  </style>\n</head>\n<body>\n' +
    bodyHTML + '\n  <script>\n' + js + '\n  <\/script>\n</body>\n</html>'
}

function buildJSOnlyPage(js) {
  return '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Weave Output</title>' +
    '<style>body{background:#0a0a0f;color:#6ee7b7;font-family:\'JetBrains Mono\',monospace;padding:24px;font-size:13px;}</style>' +
    '</head>\n<body>\n<pre id="output"></pre>\n<script>\n(function(){\n' +
    '  var _log = console.log.bind(console);\n  var out = document.getElementById("output");\n' +
    '  console.log = function() { var msg = Array.from(arguments).join(" "); out.textContent += msg + "\\n"; _log.apply(console, arguments); };\n' +
    js + '\n})();\n<\/script>\n</body>\n</html>'
}

function buildThreadPreviewPage(css) {
  return '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Thread Preview</title>' +
    '<style>* { box-sizing: border-box; margin: 0; padding: 0; }\n' + css + '</style>' +
    '</head>\n<body></body>\n</html>'
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
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
  var blob = new Blob([editor ? editor.getValue() : ''], { type: 'text/plain' })
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = document.getElementById('currentFile').textContent || 'app.web'; a.click()
})

document.getElementById('newWindowBtn').addEventListener('click', function () {
  if (!lastCompiledHTML) return
  var w = window.open('', '_blank'); w.document.write(lastCompiledHTML); w.document.close()
})

document.getElementById('previewTab').addEventListener('click', function () {
  document.getElementById('preview').style.display    = 'block'
  document.getElementById('outputView').style.display = 'none'
  document.getElementById('previewTab').classList.add('active')
  document.getElementById('outputTab').classList.remove('active')
})
document.getElementById('outputTab').addEventListener('click', function () {
  document.getElementById('preview').style.display    = 'none'
  document.getElementById('outputView').style.display = 'block'
  document.getElementById('outputTab').classList.add('active')
  document.getElementById('previewTab').classList.remove('active')
})

document.querySelectorAll('.tree-file').forEach(function (item) {
  item.addEventListener('click', function () {
    document.querySelectorAll('.tree-file').forEach(function(f){ f.classList.remove('active') })
    item.classList.add('active')
    var key  = item.dataset.example
    var name = item.querySelector('span:last-child').textContent
    document.getElementById('currentFile').textContent      = name
    document.getElementById('editorTabLabel').textContent   = name
    document.getElementById('editorBreadcrumb').textContent = name
    if (key && EXAMPLES[key] && editor) { editor.setValue(EXAMPLES[key]); compileAndPreview() }
  })
})

document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); compileAndPreview() }
})

// ══════════════════════════════════════════════
//  AI PANEL
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
  var msg = document.createElement('div')
  var avatar = document.createElement('div')
  var bubble = document.createElement('div')
  msg.className    = 'ai-message ' + (role === 'user' ? 'ai-message-user' : 'ai-message-system')
  avatar.className = 'ai-avatar'; avatar.textContent = role === 'user' ? 'U' : 'W'
  bubble.className = 'ai-bubble'
  if (code) {
    var pre = document.createElement('pre'); pre.textContent = code
    var btn = document.createElement('button')
    btn.className = 'ai-insert-btn'; btn.textContent = '⊕ Insert into editor'
    btn.addEventListener('click', function () {
      if (editor) { editor.setValue(code); compileAndPreview(); toggleAI(false) }
    })
    var textBefore = content.split(/```[\w]*\n[\s\S]*?```/)[0].trim()
    if (textBefore) {
      var p = document.createElement('p'); p.style.marginBottom = '8px'; p.textContent = textBefore
      bubble.appendChild(p)
    }
    bubble.appendChild(pre); bubble.appendChild(btn)
  } else {
    bubble.innerHTML = content
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>')
  }
  msg.appendChild(avatar); msg.appendChild(bubble)
  aiChat.appendChild(msg); aiChat.scrollTop = aiChat.scrollHeight
}

function appendThinking() {
  var msg = document.createElement('div'); msg.id = 'thinking-msg'
  var av  = document.createElement('div'); av.className  = 'ai-avatar'; av.textContent = 'W'
  var bub = document.createElement('div'); bub.className = 'ai-bubble ai-thinking'
  bub.innerHTML = '<span>Thinking</span><span class="thinking-dots"><span></span><span></span><span></span></span>'
  msg.className = 'ai-message ai-message-system'
  msg.appendChild(av); msg.appendChild(bub)
  aiChat.appendChild(msg); aiChat.scrollTop = aiChat.scrollHeight
  return msg
}

function buildSystemPrompt(code) {
  return `You are a weave.web coding assistant. weave.web is a simple language that compiles to HTML/CSS/JS.

A .web file starts with @import lines, then has blocks:

  @import HTML body     ← turns on the page {} HTML block
  @import Thread style  ← turns on the style {} CSS block
  @import JS ff         ← turns on the script {} JS block

━━ chicken-nuget (HTML) ━━
Written inside  page Name { }

Just write:  tagname optional-#id "text"
  h1 "Big title"
  h2 #subtitle "Smaller heading"
  p "A paragraph"
  p #intro "Paragraph with an id"
  button #btn "Click me"
  input #name "Placeholder text"
  a "Link text" href="https://example.com"
  span #badge "Badge"
  img src="https://picsum.photos/400" alt="Photo"
  li "List item"
  hr
  br

You can nest elements in a container block:
  div #hero {
      h1 "Title inside the div"
      p "Subtitle"
      button #cta "Get started"
  }

Container tags that support nesting: div, section, header, footer, nav, main, article, ul, ol

━━ Thread (CSS) ━━
Written inside  style { }

Works just like CSS selectors, but with friendly shortcuts:

  bg: #color           → background
  text: #color         → color
  pad: 20              → padding: 20px   (bare numbers get px added)
  pad: 20 40           → padding: 20px 40px
  radius: 12           → border-radius: 12px
  size: 18             → font-size: 18px
  weight: bold         → font-weight: bold
  w: 300    h: 200     → width / height in px
  gap: 16              → gap: 16px
  align: center        → text-align: center
  border: 2 solid #333 → border: 2px solid #333
  opacity: 0.8         → opacity: 0.8
  z: 10                → z-index: 10
  transition: smooth   → transition: all 0.3s ease

One-word shorthands (write them alone, no colon):
  flex      row      column    center    wrap
  rounded   pointer  bold      italic    uppercase
  hidden    sticky   relative  absolute  fixed
  ellipsis  glass    grid

Shadow shortcuts:
  shadow: soft    shadow: hard    shadow: glow    shadow: lifted    shadow: card

Transition shortcuts:
  transition: fast    transition: smooth    transition: slow    transition: bounce

CSS variables — put at top of style block, use with var():
  --brand: #6ee7b7
  Then:  text: var(--brand)

Nesting works normally:
  .card {
      bg: #1a1a2a
      pad: 24
      h3 {
          text: #6ee7b7
      }
  }

━━ Weave (JS) ━━
Written inside  script { }

  say("hello")               → console.log
  put("new text", "#sel")    → sets element text content
  html("#sel", "markup")     → sets element innerHTML
  on("#btn", "click", fn)    → adds click listener
  show("#sel")               → shows element
  hide("#sel")               → hides element
  task name() { }            → defines a function
  let x = 5                  → variable
  load("url")                → fetch JSON from URL (returns a Promise)
  ping("url")                → check if URL is up (returns true/false)

Everything else (if, for, while, return, +, ===, etc.) is normal JavaScript.

━━ RULES ━━
1. Always include the @import lines for each language you use
2. HTML goes in page { }, CSS in style { }, JS in script { }
3. Give elements an #id to target them from JS
4. Numbers in Thread CSS auto-get px — just write the number
5. Wrap code output in a single \`\`\`weave code block

Current editor code:
\`\`\`
${code}
\`\`\``
}

async function sendAIMessage() {
  var prompt = aiPrompt.value.trim()
  if (!prompt) return

  appendMessage('user', prompt)
  aiPrompt.value = ''; aiSend.disabled = true

  var code = (sendCtx.checked && editor) ? editor.getValue() : '(no context)'
  var fullPrompt = buildSystemPrompt(code) + '\n\nUser: ' + prompt +
    '\n\nIf writing code, wrap it in a single ```weave block.'

  var thinking = appendThinking()

  try {
    var resp = await fetch(AI_ENDPOINT, {
      method: 'POST', mode: 'cors',
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
