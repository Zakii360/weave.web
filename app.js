/* =============================================
   WEAVE.WEB — OVERHAULED APP.JS
   AI endpoint: tvxugmumfvgnvjacwwfz.supabase.co
============================================= */

const AI_ENDPOINT =
  "https://tvxugmumfvgnvjacwwfz.supabase.co/functions/v1/GROQAI"

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

// ── EDITOR SETUP ──────────────────────────────

let editor

require.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" }
})

require(["vs/editor/editor.main"], () => {

  // Register weave language
  monaco.languages.register({ id: 'weave' })
  monaco.languages.setMonarchTokensProvider('weave', {
    tokenizer: {
      root: [
        [/@import\s+\w+\s+\w+/, 'keyword.import'],
        [/\b(page|style|script|body|task|on|put|say)\b/, 'keyword'],
        [/\b(h1|h2|h3|h4|h5|h6|p|div|span|button|input|section|nav|header|footer|main)\b/, 'tag'],
        [/"[^"]*"/, 'string'],
        [/#[\w-]+/, 'attribute.name'],
        [/\/\/.*$/, 'comment'],
        [/\{|\}/, 'delimiter.bracket'],
      ]
    }
  })

  monaco.editor.defineTheme('weave-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword.import', foreground: '818cf8', fontStyle: 'italic' },
      { token: 'keyword', foreground: '818cf8' },
      { token: 'tag', foreground: '6ee7b7' },
      { token: 'string', foreground: 'fb923c' },
      { token: 'attribute.name', foreground: '38bdf8' },
      { token: 'comment', foreground: '4a4a6a', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#0a0a0f',
      'editor.foreground': '#e8e8f0',
      'editorLineNumber.foreground': '#2a2a40',
      'editorLineNumber.activeForeground': '#4a4a6a',
      'editor.selectionBackground': '#1e1e30',
      'editor.lineHighlightBackground': '#0f0f1a',
      'editorCursor.foreground': '#6ee7b7',
      'editor.inactiveSelectionBackground': '#14142000',
    }
  })

  editor = monaco.editor.create(
    document.getElementById("editor"),
    {
      value: EXAMPLES.main,
      language: "weave",
      theme: "weave-dark",
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
    }
  )

  editor.onDidChangeCursorPosition(e => {
    const { lineNumber: ln, column: col } = e.position
    document.getElementById("lineColStatus").textContent =
      `Ln ${ln}, Col ${col}`
  })

  compileAndPreview()
})

// ── COMPILER ──────────────────────────────────

function compileWeave(source) {

  // Strip import lines for processing
  const clean = source
    .replace(/@import\s+\w+\s+\w+\n?/g, '')
    .trim()

  let title = 'weave.web'
  let bodyHTML = ''
  let rawCSS = ''
  let rawJS = ''

  // Extract title
  const titleMatch = clean.match(/title\s+"([^"]+)"/)
  if (titleMatch) title = titleMatch[1]

  // Extract page/body block
  const pageMatch = clean.match(/page(?:\s+\w+)?\s*\{([\s\S]*?)\n\}/)
  if (pageMatch) {
    const pageContent = pageMatch[1]
    bodyHTML = parseElements(pageContent)
  }

  // Extract style block
  const styleMatch = clean.match(/style(?:\s+\w+)?\s*\{([\s\S]*)\}[\s]*(?:script|$)/)
  if (styleMatch) {
    const styleSource = styleMatch[1].trim()
    // Check if it's Thread syntax (no colons) or regular CSS (has colons)
    const isThread = !styleSource.includes(':')
    rawCSS = isThread ? compileThread(styleSource) : compileCSSLike(styleSource)
  }

  // Extract script block
  const scriptMatch = clean.match(/script\s*\{([\s\S]*)\}[\s]*$/)
  if (scriptMatch) {
    rawJS = compileScript(scriptMatch[1].trim())
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHTML(title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ${rawCSS}
  </style>
</head>
<body>
  ${bodyHTML}
  <script>
    ${rawJS}
  <\/script>
</body>
</html>`
}

function parseElements(content) {
  let html = ''
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    // Detect block containers: div #id { or section Name {
    // Skip title
    if (line.startsWith('title ')) continue

    // h1-h6 with optional id and text
    const hMatch = line.match(/^(h[1-6])(?:\s+id="([^"]+)")?\s+"([^"]+)"$/)
    if (hMatch) {
      const [, tag, id, text] = hMatch
      html += `<${tag}${id ? ` id="${id}"` : ''}>${escapeHTML(text)}</${tag}>\n  `
      continue
    }

    // p
    const pMatch = line.match(/^p(?:\s+id="([^"]+)")?\s+"([^"]+)"$/)
    if (pMatch) {
      const [, id, text] = pMatch
      html += `<p${id ? ` id="${id}"` : ''}>${escapeHTML(text)}</p>\n  `
      continue
    }

    // button with #id shorthand
    const btnMatch = line.match(/^button(?:\s+(#[\w-]+))?\s+"([^"]+)"$/)
    if (btnMatch) {
      const id = btnMatch[1] ? btnMatch[1].replace('#', '') : ''
      const text = btnMatch[2]
      html += `<button${id ? ` id="${id}"` : ''}>${escapeHTML(text)}</button>\n  `
      continue
    }

    // input
    const inputMatch = line.match(/^input(?:\s+(#[\w-]+))?\s+(?:placeholder=)?"([^"]+)"$/)
    if (inputMatch) {
      const id = inputMatch[1] ? inputMatch[1].replace('#', '') : ''
      html += `<input${id ? ` id="${id}"` : ''} placeholder="${escapeHTML(inputMatch[2])}" />\n  `
      continue
    }

    // span
    const spanMatch = line.match(/^span(?:\s+id="([^"]+)")?\s+"([^"]+)"$/)
    if (spanMatch) {
      html += `<span${spanMatch[1] ? ` id="${spanMatch[1]}"` : ''}>${escapeHTML(spanMatch[2])}</span>\n  `
      continue
    }

    // div or section with text
    const divMatch = line.match(/^(div|section|header|nav|footer|main)(?:\s+(#[\w-]+))?\s+"([^"]+)"$/)
    if (divMatch) {
      const [, tag, idStr, text] = divMatch
      const id = idStr ? idStr.replace('#', '') : ''
      html += `<${tag}${id ? ` id="${id}"` : ''}>${escapeHTML(text)}</${tag}>\n  `
      continue
    }
  }

  return html
}

function compileCSSLike(source) {
  // Standard CSS-like syntax (may have colons)
  return source
    .replace(/\n(\s+)(\w[\w-]*)(\s+)([^{;\n]+)(?!\s*\{)/g, '\n$1$2:$3$4')
    .replace(/(\d+)px?(\s)/g, '$1px$2')
    + '\n'
}

function compileThread(source) {
  const aliases = {
    bg: 'background', text: 'color', radius: 'border-radius',
    size: 'font-size', weight: 'font-weight', pad: 'padding',
    w: 'width', h: 'height', align: 'text-align', gap: 'gap', border: 'border'
  }
  const numericProps = ['padding','margin','border-radius','font-size','width','height','gap','min-height','max-width']

  const lines = source.split('\n').map(l => l.trim()).filter(Boolean)
  let css = ''
  const stack = []

  for (const line of lines) {
    if (line.endsWith('{')) {
      const sel = line.replace('{', '').trim()
      stack.push(sel)
      css += `${sel} {\n`
      continue
    }
    if (line === '}') {
      stack.pop()
      css += '}\n'
      continue
    }

    // Shorthand keywords
    if (line === 'flex')   { css += '  display: flex;\n'; continue }
    if (line === 'row')    { css += '  flex-direction: row;\n'; continue }
    if (line === 'column') { css += '  flex-direction: column;\n'; continue }
    if (line === 'center') { css += '  justify-content: center;\n  align-items: center;\n'; continue }
    if (line === 'wrap')   { css += '  flex-wrap: wrap;\n'; continue }

    // colon syntax: prop: value
    const colonIdx = line.indexOf(':')
    if (colonIdx > -1) {
      let prop = line.slice(0, colonIdx).trim()
      let val = line.slice(colonIdx + 1).trim()
      prop = aliases[prop] || prop
      if (numericProps.includes(prop)) {
        val = val.split(' ').map(v => (!isNaN(v) && v !== '') ? v + 'px' : v).join(' ')
      }
      css += `  ${prop}: ${val};\n`
      continue
    }

    // no-colon: prop value
    const spIdx = line.indexOf(' ')
    if (spIdx > -1) {
      let prop = line.slice(0, spIdx).trim()
      let val = line.slice(spIdx + 1).trim()
      prop = aliases[prop] || prop
      if (numericProps.includes(prop)) {
        val = val.split(' ').map(v => (!isNaN(v) && v !== '') ? v + 'px' : v).join(' ')
      }
      css += `  ${prop}: ${val};\n`
    }
  }

  return css
}

function compileScript(source) {
  let js = ''

  // on("selector", "event", handler)
  const onMatches = [...source.matchAll(/on\("([^"]+)",\s*"([^"]+)",\s*(\w+)\)/g)]
  for (const m of onMatches) {
    js += `document.querySelector("${m[1]}").addEventListener("${m[2]}", ${m[3]});\n`
  }

  // task name() { ... }
  const taskMatches = [...source.matchAll(/task\s+(\w+)\s*\(\)\s*\{([\s\S]*?)\}/g)]
  for (const m of taskMatches) {
    const body = compileTaskBody(m[2].trim())
    js += `function ${m[1]}() {\n  ${body}\n}\n`
  }

  return js
}

function compileTaskBody(body) {
  let js = ''
  const lines = body.split('\n').map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    // put("text", "selector")
    const putMatch = line.match(/put\("([^"]+)",\s*"([^"]+)"\)/)
    if (putMatch) {
      js += `document.querySelector("${putMatch[2]}").innerText = "${putMatch[1]}";\n  `
      continue
    }
    // say("text")
    const sayMatch = line.match(/say\("([^"]+)"\)/)
    if (sayMatch) { js += `console.log("${sayMatch[1]}");\n  `; continue }
    // alert("text")
    const alertMatch = line.match(/alert\("([^"]+)"\)/)
    if (alertMatch) { js += `alert("${alertMatch[1]}");\n  `; continue }
  }
  return js
}

function escapeHTML(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

// ── PREVIEW ───────────────────────────────────

let lastCompiledHTML = ''

function compileAndPreview() {
  if (!editor) return

  const source = editor.getValue()
  setStatus('loading', 'Compiling…')

  try {
    const compiled = compileWeave(source)
    lastCompiledHTML = compiled

    const preview = document.getElementById('preview')
    const outputView = document.getElementById('outputView')

    preview.srcdoc = compiled
    outputView.textContent = compiled

    setStatus('ok', 'Compiled')
  } catch (err) {
    setStatus('error', 'Error: ' + err.message)
  }
}

function setStatus(type, msg) {
  const dot = document.getElementById('compileIndicator')
  const text = document.getElementById('compileStatus')
  const navDot = document.getElementById('statusDot')
  const navText = document.getElementById('statusText')

  dot.className = 'status-indicator' + (type === 'error' ? ' error' : type === 'loading' ? ' loading' : '')
  text.textContent = msg
  navDot.className = 'status-dot' + (type === 'error' ? ' error' : type === 'loading' ? ' loading' : '')
  navText.textContent = msg
}

// ── TOOLBAR BUTTONS ───────────────────────────

document.getElementById('compileBtn')?.addEventListener('click', compileAndPreview)
document.getElementById('runBtn')?.addEventListener('click', compileAndPreview)
document.getElementById('refreshBtn')?.addEventListener('click', compileAndPreview)

document.getElementById('downloadBtn')?.addEventListener('click', () => {
  const source = editor?.getValue() || ''
  const blob = new Blob([source], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = document.getElementById('currentFile').textContent || 'app.web'
  a.click()
})

document.getElementById('newWindowBtn')?.addEventListener('click', () => {
  if (!lastCompiledHTML) return
  const w = window.open()
  w.document.write(lastCompiledHTML)
  w.document.close()
})

// Output tab toggle
let showingOutput = false
document.getElementById('outputTab')?.addEventListener('click', () => {
  showingOutput = !showingOutput
  const preview = document.getElementById('preview')
  const outputView = document.getElementById('outputView')
  const tab = document.getElementById('outputTab')

  if (showingOutput) {
    preview.style.display = 'none'
    outputView.style.display = 'block'
    tab.classList.add('active')
  } else {
    preview.style.display = 'block'
    outputView.style.display = 'none'
    tab.classList.remove('active')
  }
})

// ── FILE TREE ─────────────────────────────────

document.querySelectorAll('.tree-file').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.tree-file').forEach(f => f.classList.remove('active'))
    item.classList.add('active')

    const exKey = item.dataset.example
    if (exKey && EXAMPLES[exKey] && editor) {
      editor.setValue(EXAMPLES[exKey])
      const name = item.querySelector('span:last-child').textContent
      document.getElementById('currentFile').textContent = name
      document.getElementById('editorTabLabel').textContent = name
      document.getElementById('editorBreadcrumb').textContent = name
      compileAndPreview()
    }
  })
})

// Keyboard shortcut
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    compileAndPreview()
  }
})

// ── AI PANEL ──────────────────────────────────

const aiPanel    = document.getElementById('aiPanel')
const aiToggle   = document.getElementById('aiToggle')
const aiClose    = document.getElementById('aiClose')
const aiPrompt   = document.getElementById('aiPrompt')
const aiSend     = document.getElementById('aiSend')
const aiChat     = document.getElementById('aiChat')
const sendCtx    = document.getElementById('sendContext')

let aiOpen = false

function toggleAI(open) {
  aiOpen = open !== undefined ? open : !aiOpen
  if (aiOpen) {
    aiPanel.classList.add('open')
    document.getElementById('aiToggleLabel').textContent = 'Close AI'
  } else {
    aiPanel.classList.remove('open')
    document.getElementById('aiToggleLabel').textContent = 'AI'
  }
}

aiToggle?.addEventListener('click', () => toggleAI())
aiClose?.addEventListener('click', () => toggleAI(false))

// AI chips
document.querySelectorAll('.ai-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    aiPrompt.value = chip.dataset.prompt
    if (!aiOpen) toggleAI(true)
    aiPrompt.focus()
  })
})

aiPrompt?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendAIMessage()
  }
})

aiSend?.addEventListener('click', sendAIMessage)

function appendMessage(role, content, code) {
  const msg = document.createElement('div')
  msg.className = `ai-message ${role === 'user' ? 'ai-message-user' : 'ai-message-system'}`

  const avatar = document.createElement('div')
  avatar.className = 'ai-avatar'
  avatar.textContent = role === 'user' ? 'U' : 'W'

  const bubble = document.createElement('div')
  bubble.className = 'ai-bubble'

  if (code) {
    // Has code block
    const pre = document.createElement('pre')
    pre.textContent = code

    const insertBtn = document.createElement('button')
    insertBtn.className = 'ai-insert-btn'
    insertBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Insert into editor`
    insertBtn.addEventListener('click', () => {
      if (editor) {
        editor.setValue(code)
        compileAndPreview()
        toggleAI(false)
      }
    })

    // Text before code block
    const textParts = content.split(/```[\w]*\n[\s\S]*?```/g)
    if (textParts[0]) {
      const textEl = document.createElement('p')
      textEl.style.marginBottom = '8px'
      textEl.textContent = textParts[0].trim()
      bubble.appendChild(textEl)
    }
    bubble.appendChild(pre)
    bubble.appendChild(insertBtn)
  } else {
    bubble.innerHTML = content
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
  const msg = document.createElement('div')
  msg.className = 'ai-message ai-message-system'
  msg.id = 'thinking-msg'

  const avatar = document.createElement('div')
  avatar.className = 'ai-avatar'
  avatar.textContent = 'W'

  const bubble = document.createElement('div')
  bubble.className = 'ai-bubble ai-thinking'
  bubble.innerHTML = `<span>Thinking</span>
    <span class="thinking-dots">
      <span></span><span></span><span></span>
    </span>`

  msg.appendChild(avatar)
  msg.appendChild(bubble)
  aiChat.appendChild(msg)
  aiChat.scrollTop = aiChat.scrollHeight
  return msg
}

async function sendAIMessage() {
  const prompt = aiPrompt.value.trim()
  if (!prompt) return

  appendMessage('user', prompt)
  aiPrompt.value = ''
  aiSend.disabled = true

  let fullPrompt = prompt
  if (sendCtx.checked && editor) {
    const code = editor.getValue()
    fullPrompt = `You are an expert weave.web developer. The user is working in the weave.web IDE.

Weave.web language reference:
- Pages: page Name { h1 "text"  p "text"  button #id "text" }
- Thread CSS: style { selector { prop: value  flex  center  row  column } }
- Script: script { on("#id", "event", handler)  task name() { put("text", "#sel") } }
- Imports: @import HTML body | @import Thread style | @import JS ff

Current editor code:
\`\`\`
${code}
\`\`\`

User request: ${prompt}

IMPORTANT: If you generate code, wrap it in a single \`\`\`weave ... \`\`\` code block. Keep explanations brief.`
  }

  const thinking = appendThinking()

  try {
    const resp = await fetch(AI_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: fullPrompt })
    })

    const raw = await resp.text()
    let data = {}

    try { data = JSON.parse(raw) } catch { throw new Error(raw) }

    if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`)

    const result = data.result || data.content || ''
    if (!result) throw new Error('AI returned no result.')

    thinking.remove()

    // Extract code block if present
    const codeMatch = result.match(/```(?:weave|web)?\n([\s\S]*?)```/)
    if (codeMatch) {
      const code = codeMatch[1].trim()
      appendMessage('assistant', result, code)
    } else {
      appendMessage('assistant', result)
    }

  } catch (err) {
    thinking.remove()
    appendMessage('assistant', `⚠️ Error: ${err.message}`)
  } finally {
    aiSend.disabled = false
  }
}
