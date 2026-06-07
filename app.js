/* =============================================
   WEAVE.WEB — APP.JS (fixed)
   AI  endpoint (it's Groq, not sonnet): tvxugmumfvgnvjacwwfz.supabase.co
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
        background: #0f172a
        color: white
        padding: 40px
        font-family: Arial
    }

    h1 {
        color: #6ee7b7
        margin-bottom: 12px
    }

    p {
        color: #94a3b8
        margin-bottom: 24px
    }

    button {
        background: royalblue
        color: white
        border: none
        padding: 14px 20px
        border-radius: 12px
        cursor: pointer
    }
}

script {

    on("#btn", "click", clicked)

    task clicked() {
        put("Runtime works!", "h1")
    }
}`,

  hello: `@import HTML body

page {
    title "Hello"

    body {
        h1 "Hello World"
        p "Welcome to weave.web"
    }
}`,

  hybrid: `@import HTML body
@import JS ff

page {
    title "Hybrid"

    body {
        h1 id="title" "Hello"
        button id="btn" "Click"
    }
}

script {
    on("#btn", "click", clicked)

    task clicked() {
        put("Clicked!", "#title")
    }
}`,

  thread: `@import HTML body
@import Thread style

page {
    title "Thread Demo"

    body {
        h1 "Thread Styles"
        p "Powered by Thread CSS"
        button id="cta" "Get Started"
    }
}

style {

    body {
        background: #0a0a0f
        color: #e8e8f0
        padding: 60px
        font-family: Arial
        flex
        column
        center
        min-height: 100vh
    }

    h1 {
        font-size: 48
        color: #6ee7b7
        margin-bottom: 16
    }

    p {
        color: #7878a0
        margin-bottom: 32
        font-size: 18
    }

    button {
        background: #6ee7b7
        color: #0a0a0f
        border: none
        padding: 14 28
        border-radius: 8
        font-size: 16
        cursor: pointer
        font-weight: bold
    }
}`
}

// ── GLOBALS ───────────────────────────────────

let editor = null
let lastCompiledHTML = ''
let showingOutput = false
let aiOpen = false

// ── MONACO SETUP ──────────────────────────────

require.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' }
})

require(['vs/editor/editor.main'], function () {

  // Register weave language
  monaco.languages.register({ id: 'weave' })
  monaco.languages.setMonarchTokensProvider('weave', {
    tokenizer: {
      root: [
        [/@[a-z]+\b.*/, 'keyword.directive'],
        [/\b(page|style|script|body|task|on|put|say|alert)\b/, 'keyword'],
        [/\b(h[1-6]|p|div|span|button|input|section|nav|header|footer|main)\b/, 'tag'],
        [/"[^"]*"/, 'string'],
        [/#[\w-]+/, 'type'],
        [/\/\/.*$/, 'comment'],
        [/[{}]/, 'delimiter.bracket'],
      ]
    }
  })

  monaco.editor.defineTheme('weave-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword.directive', foreground: '818cf8', fontStyle: 'italic' },
      { token: 'keyword',  foreground: '818cf8' },
      { token: 'tag',      foreground: '6ee7b7' },
      { token: 'string',   foreground: 'fb923c' },
      { token: 'type',     foreground: '38bdf8' },
      { token: 'comment',  foreground: '4a4a6a', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background':               '#0a0a0f',
      'editor.foreground':               '#e8e8f0',
      'editorLineNumber.foreground':     '#2a2a40',
      'editorLineNumber.activeForeground':'#4a4a6a',
      'editor.selectionBackground':      '#1e1e3088',
      'editor.lineHighlightBackground':  '#0f0f1a',
      'editorCursor.foreground':         '#6ee7b7',
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

  // Auto-compile on change (debounced)
  var compileTimer
  editor.onDidChangeModelContent(function () {
    clearTimeout(compileTimer)
    compileTimer = setTimeout(compileAndPreview, 600)
  })

  compileAndPreview()
})

// ── COMPILER ──────────────────────────────────

function escapeHTML(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
}

function compileWeave(source) {
  var clean = source.replace(/@import\s+\S+\s+\S+\n?/g, '').trim()

  var title = 'weave.web'
  var bodyHTML = ''
  var rawCSS = ''
  var rawJS = ''

  // Title
  var titleM = clean.match(/title\s+"([^"]+)"/)
  if (titleM) title = titleM[1]

  // Page block — find the outermost page/body block
  var pageM = clean.match(/page(?:\s+\w+)?\s*\{([\s\S]*?)\n\}/)
  if (pageM) bodyHTML = parseElements(pageM[1])

  // Style block — greedy so it gets the full block
  var styleM = clean.match(/style(?:\s+\w+)?\s*\{([\s\S]+?)\}(?=\s*(?:script|$))/m)
  if (styleM) {
    var styleBody = styleM[1].trim()
    rawCSS = compileThreadCSS(styleBody)
  }

  // Script block
  var scriptM = clean.match(/script\s*\{([\s\S]+)\}[\s]*$/)
  if (scriptM) rawJS = compileScript(scriptM[1].trim())

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <title>' + escapeHTML(title) + '</title>\n' +
    '  <style>\n* { box-sizing: border-box; margin: 0; padding: 0; }\n' + rawCSS + '\n  </style>\n</head>\n<body>\n' +
    '  ' + bodyHTML + '\n' +
    '  <script>\n' + rawJS + '\n  <\/script>\n' +
    '</body>\n</html>'
}

function parseElements(content) {
  var html = ''
  var lines = content.split('\n').map(function(l){ return l.trim() }).filter(Boolean)

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (!line || line.startsWith('title ')) continue

    // h1–h6  [id="x"]  "text"
    var hm = line.match(/^(h[1-6])(?:\s+id="([^"]+)")?\s+"([^"]+)"$/)
    if (hm) { html += '<' + hm[1] + (hm[2] ? ' id="'+hm[2]+'"' : '') + '>' + escapeHTML(hm[3]) + '</' + hm[1] + '>\n  '; continue }

    // p
    var pm = line.match(/^p(?:\s+id="([^"]+)")?\s+"([^"]+)"$/)
    if (pm) { html += '<p' + (pm[1] ? ' id="'+pm[1]+'"' : '') + '>' + escapeHTML(pm[2]) + '</p>\n  '; continue }

    // button  [#id]  "text"
    var bm = line.match(/^button(?:\s+(#[\w-]+))?\s+"([^"]+)"$/)
    if (bm) { var bid = bm[1] ? bm[1].slice(1) : ''; html += '<button' + (bid ? ' id="'+bid+'"' : '') + '>' + escapeHTML(bm[2]) + '</button>\n  '; continue }

    // input
    var im = line.match(/^input(?:\s+(#[\w-]+))?\s+"([^"]+)"$/)
    if (im) { var iid = im[1] ? im[1].slice(1) : ''; html += '<input' + (iid ? ' id="'+iid+'"' : '') + ' placeholder="' + escapeHTML(im[2]) + '" />\n  '; continue }

    // span
    var sm = line.match(/^span(?:\s+id="([^"]+)")?\s+"([^"]+)"$/)
    if (sm) { html += '<span' + (sm[1] ? ' id="'+sm[1]+'"' : '') + '>' + escapeHTML(sm[2]) + '</span>\n  '; continue }

    // div / section / etc
    var dm = line.match(/^(div|section|header|nav|footer|main|article)(?:\s+(#[\w-]+))?\s+"([^"]+)"$/)
    if (dm) { var did = dm[2] ? dm[2].slice(1) : ''; html += '<'+dm[1]+(did?' id="'+did+'"':'')+'>'+escapeHTML(dm[3])+'</'+dm[1]+'>\n  '; continue }
  }

  return html
}

function compileThreadCSS(source) {
  var aliases = {
    bg:'background', text:'color', radius:'border-radius',
    size:'font-size', weight:'font-weight', pad:'padding',
    w:'width', h:'height', align:'text-align', gap:'gap', border:'border'
  }
  var numericProps = ['padding','margin','border-radius','font-size','width','height',
    'gap','min-height','max-width','line-height','letter-spacing','top','left','right','bottom']

  var lines = source.split('\n').map(function(l){ return l.trim() }).filter(Boolean)
  var css = ''
  var depth = 0

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]

    if (line.endsWith('{')) {
      var sel = line.slice(0, -1).trim()
      css += sel + ' {\n'
      depth++
      continue
    }
    if (line === '}') {
      css += '}\n'
      depth--
      continue
    }

    var indent = '  '

    // Shorthand keywords
    if (line === 'flex')   { css += indent + 'display: flex;\n';             continue }
    if (line === 'row')    { css += indent + 'flex-direction: row;\n';       continue }
    if (line === 'column') { css += indent + 'flex-direction: column;\n';   continue }
    if (line === 'center') { css += indent + 'justify-content: center;\n' + indent + 'align-items: center;\n'; continue }
    if (line === 'wrap')   { css += indent + 'flex-wrap: wrap;\n';           continue }
    if (line === 'relative') { css += indent + 'position: relative;\n';     continue }
    if (line === 'absolute') { css += indent + 'position: absolute;\n';     continue }
    if (line === 'fixed')    { css += indent + 'position: fixed;\n';        continue }
    if (line === 'bold')     { css += indent + 'font-weight: bold;\n';      continue }
    if (line === 'italic')   { css += indent + 'font-style: italic;\n';     continue }
    if (line === 'pointer')  { css += indent + 'cursor: pointer;\n';        continue }
    if (line === 'block')    { css += indent + 'display: block;\n';         continue }
    if (line === 'inline')   { css += indent + 'display: inline;\n';        continue }
    if (line === 'none')     { css += indent + 'display: none;\n';          continue }

    // Colon or space delimited property: value
    var colonIdx = line.indexOf(':')
    var spaceIdx = line.indexOf(' ')
    var prop, val

    if (colonIdx > 0) {
      prop = line.slice(0, colonIdx).trim()
      val  = line.slice(colonIdx + 1).trim()
    } else if (spaceIdx > 0) {
      prop = line.slice(0, spaceIdx).trim()
      val  = line.slice(spaceIdx + 1).trim()
    } else {
      continue
    }

    prop = aliases[prop] || prop

    if (numericProps.includes(prop)) {
      val = val.split(/\s+/).map(function(v) {
        return (!isNaN(v) && v !== '') ? v + 'px' : v
      }).join(' ')
    }

    css += indent + prop + ': ' + val + ';\n'
  }

  return css
}

function compileScript(source) {
  var js = ''

  // on("sel", "event", handler)
  var onRe = /on\("([^"]+)",\s*"([^"]+)",\s*(\w+)\)/g
  var om
  while ((om = onRe.exec(source)) !== null) {
    js += 'document.querySelector("' + om[1] + '").addEventListener("' + om[2] + '", ' + om[3] + ');\n'
  }

  // task name() { ... }
  var taskRe = /task\s+(\w+)\s*\(\)\s*\{([\s\S]*?)\}/g
  var tm
  while ((tm = taskRe.exec(source)) !== null) {
    js += 'function ' + tm[1] + '() {\n  ' + compileTaskBody(tm[2].trim()) + '\n}\n'
  }

  return js
}

function compileTaskBody(body) {
  var js = ''
  var lines = body.split('\n').map(function(l){ return l.trim() }).filter(Boolean)
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    var putM = line.match(/put\("([^"]+)",\s*"([^"]+)"\)/)
    if (putM) { js += 'document.querySelector("' + putM[2] + '").innerText = "' + putM[1] + '";\n  '; continue }
    var sayM = line.match(/say\("([^"]+)"\)/)
    if (sayM) { js += 'console.log("' + sayM[1] + '");\n  '; continue }
    var alertM = line.match(/alert\("([^"]+)"\)/)
    if (alertM) { js += 'alert("' + alertM[1] + '");\n  '; continue }
  }
  return js
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

// ── TOOLBAR BUTTONS ───────────────────────────

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

// Output / Preview tab toggle
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

    var key = item.dataset.example
    var name = item.querySelector('span:last-child').textContent
    document.getElementById('currentFile').textContent    = name
    document.getElementById('editorTabLabel').textContent  = name
    document.getElementById('editorBreadcrumb').textContent = name

    if (key && EXAMPLES[key]) {
      if (editor) {
        editor.setValue(EXAMPLES[key])
        compileAndPreview()
      } else {
        // Editor not loaded yet — wait for it
        var waitForEditor = setInterval(function () {
          if (editor) {
            clearInterval(waitForEditor)
            editor.setValue(EXAMPLES[key])
            compileAndPreview()
          }
        }, 100)
      }
    }
  })
})

// Keyboard shortcut: Ctrl/Cmd + Enter → compile
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
  if (aiOpen) {
    aiPanel.classList.add('open')
    document.getElementById('aiToggleLabel').textContent = 'Close AI'
  } else {
    aiPanel.classList.remove('open')
    document.getElementById('aiToggleLabel').textContent = 'AI'
  }
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
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendAIMessage()
  }
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
    btn.className = 'ai-insert-btn'
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Insert into editor'
    btn.addEventListener('click', function () {
      if (editor) {
        editor.setValue(code)
        compileAndPreview()
        toggleAI(false)
      }
    })

    // Text before the code block
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
    // Render inline code and line breaks
    bubble.innerHTML = content
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
  }

  msg.appendChild(avatar)
  msg.appendChild(bubble)
  aiChat.appendChild(msg)
  aiChat.scrollTop = aiChat.scrollHeight
  return msg
}

function appendThinking() {
  var msg    = document.createElement('div')
  var avatar = document.createElement('div')
  var bubble = document.createElement('div')

  msg.className    = 'ai-message ai-message-system'
  msg.id           = 'thinking-msg'
  avatar.className = 'ai-avatar'
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
  aiPrompt.value = ''
  aiSend.disabled = true

  var fullPrompt = prompt
  if (sendCtx.checked && editor) {
    var code = editor.getValue()
    fullPrompt = 'You are an expert weave.web developer assistant. weave.web is a language that compiles to HTML/CSS/JS.\n\n' +
      'Weave.web language reference:\n' +
      '- Imports: @import HTML body | @import Thread style | @import JS ff\n' +
      '- Page block: page Name { h1 "text"  p "text"  button #id "text"  input #id "placeholder" }\n' +
      '- Thread CSS: style { selector { prop: value  OR  prop value } keywords: flex center row column wrap bold pointer }\n' +
      '- Script: script { on("#id", "event", handler)  task name() { put("text", "#sel")  alert("msg") } }\n\n' +
      'Current editor code:\n```\n' + code + '\n```\n\n' +
      'User request: ' + prompt + '\n\n' +
      'If generating code, wrap it in a single ```weave code block. Keep explanations brief.'
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
    if (codeMatch) {
      appendMessage('assistant', result, codeMatch[1].trim())
    } else {
      appendMessage('assistant', result)
    }
  } catch (err) {
    thinking.remove()
    appendMessage('assistant', '⚠️ Error: ' + err.message)
  } finally {
    aiSend.disabled = false
  }
}
