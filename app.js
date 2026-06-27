/* =====================================================================
   WEAVE.WEB — APP.JS  (Overhauled Engine v2.0)
   
   What's new:
   ─────────────────────────────────────────────────────────────────────
   CHICKEN-NUGET (.web HTML blocks):
     • Nested elements:  div #app { h1 "title"  p "body" }
     • img  src="url"  alt="text"
     • ul/ol { li "item" ... }
     • table { tr { td "cell" ... } ... }
     • textarea #id  rows=4  "placeholder"
     • select #id { option "val" "Label" ... }
     • form #id { ... children ... }
     • section / article / header / footer / nav / aside with children
     • label for="id" "text"
     • Classes:  div .card.hero "text"
     • data-* attrs:  button #btn data-index=0 "Click"
     • Inline conditionals: if (cond) { el "text" }
     • each loop:  each item in items { li item }
     • slot "name" — named slots for component-like reuse
     • component MyCard { ... }  →  <MyCard />  renders inline
     • Void elements: hr  br  input  img

   THREAD (.web CSS blocks):
     • Fully nested selectors with & support:  &:hover { text: red }
     • Pseudo-classes:  .btn:hover { ... }
     • @media queries:  @media (max-width: 768px) { ... }
     • @keyframes:  @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
     • CSS variables:  --primary: #6ee7b7   used as  text: var(--primary)
     • New aliases:  opacity, overflow, transform, transition, z, display, cursor
     • New shorthands:  grid  sticky  hidden  ellipsis  scroll  glass  glow
     • New presets:
         shadow: soft | hard | glow | lifted | card | none
         transition: fast | smooth | slow | bounce
         gradient: sunset | ocean | forest | neon | dusk
         glass — frosted glass effect
         glow  — neon glow on text
     • animation shorthand:  animate: name duration easing
     • Multi-value shorthand: pad: 20 40  →  padding: 20px 40px
     • border shorthand: border: 2 solid #333  (auto-px on width)
     • clamp() for fluid typography:  size: clamp(16, 2vw, 24)

   WEAVE (.web JS blocks):
     • async/await automatic:  task + await calls auto-wrap in async
     • show(sel)  hide(sel)  toggle(sel) — display shortcuts
     • addClass(sel, cls)  removeClass(sel, cls)  toggleClass(sel, cls)
     • attr(sel, name, val)  getAttr(sel, name) — attribute helpers
     • html(sel, markup)  — innerHTML setter
     • style(sel, prop, val) — inline style setter
     • query(sel) → element   queryAll(sel) → [...elements]
     • emit(sel, "event", detail)  — CustomEvent dispatch
     • watch(sel, fn)  — MutationObserver shorthand
     • store("key", val)  get("key")  — localStorage wrappers
     • route("path", fn)  — hash-based router
     • repeat(n, fn)  — loop helper
     • wait(ms)  — Promise sleep
     • fetch shortcuts:  get(url)  post(url, body)  — JSON fetch helpers
     •  tween(sel, props, ms) — lightweight CSS transition trigger
     • Destructuring: let {x, y} = obj
     • Arrow tasks:  task name = (args) => expr
     • try/catch/finally pass-through
     • Template literals pass-through
     • Class syntax pass-through
     • Spread/rest pass-through

   AI CHATBOT (Supabase Edge → Groq):
     • System prompt now encodes the FULL v2 language spec
     • Streaming response support
     • Multi-turn conversation memory (last 8 exchanges)
     • Code-block detection with diff preview before inserting
     • "Apply to selection" — AI edits only selected text
     • Inline AI: Ctrl+K triggers an inline prompt in the editor

   EDITOR:
     • Multi-file tabs (virtual FS in memory)
     • Ctrl+P — quick file open
     • Ctrl+D — duplicate line
     • Format on save (Ctrl+S)
     • Error markers from compile (Monaco decorations)
     • Ctrl+K — inline AI prompt
     • Type-aware autocomplete for all three languages

===================================================================== */

const AI_ENDPOINT = "https://tvxugmumfvgnvjacwwfz.supabase.co/functions/v1/GROQAI"

// ── VIRTUAL FILE SYSTEM ───────────────────────────────────────────────

const VFS = {}          // filename → source
let activeFile = 'app.web'
let aiHistory  = []     // multi-turn [{role,content}]

// ── EXAMPLES ─────────────────────────────────────────────────────────

const EXAMPLES = {

  main: `@import HTML body
@import Thread style
@import JS ff

// ── Full-featured weave.web v2 demo ──────────────────────────────────

component Card {
    div .card {
        slot "content"
    }
}

page Dashboard {

    header #topbar {
        h1 "weave.web v2"
        nav {
            a #nav-home   "Home"     href="#"
            a #nav-about  "About"    href="#"
            a #nav-docs   "Docs"     href="#"
        }
    }

    main #app {

        section .hero {
            h2 "Build insane web apps"
            p  "One .web file. Three languages. No limits."
            div .btn-row {
                button #primary-btn .btn-primary "Get Started"
                button #demo-btn   .btn-ghost    "See Demo"
            }
        }

        section .cards {
            div .card {
                h3 "Weave"
                p  "Logic & interactivity"
            }
            div .card {
                h3 "Thread"
                p  "Styles & design tokens"
            }
            div .card {
                h3 "chicken-nuget"
                p  "Structure & layout"
            }
        }

        div #counter-box {
            h2 #count "0"
            p  "clicks"
            button #inc-btn  "+1"
            button #dec-btn  "-1"
            button #rst-btn  "Reset"
        }
    }
}

style {

    --primary: #6ee7b7
    --accent:  #818cf8
    --bg:      #080810
    --surface: #0f0f1e
    --text:    #e8e8f0
    --muted:   #3a3a55

    * {
        box-sizing: border-box
    }

    body {
        bg: var(--bg)
        text: var(--text)
        font-family: "Syne", sans-serif
        margin: 0
        min-height: 100vh
    }

    header {
        flex
        row
        align: center
        justify-content: space-between
        pad: 16 32
        bg: var(--surface)
        border-bottom: 1px solid var(--muted)
        sticky
        top: 0
        z: 100

        h1 {
            size: 20
            text: var(--primary)
            weight: 700
        }

        nav {
            flex
            row
            gap: 8

            a {
                text: var(--text)
                text-decoration: none
                pad: 8 16
                radius: 8
                size: 14
                transition: fast

                &:hover {
                    bg: var(--muted)
                    text: var(--primary)
                }
            }
        }
    }

    main {
        pad: 40
        max-width: 1100
        margin: 0 auto
    }

    .hero {
        flex
        column
        center
        pad: 60 20
        text-align: center
        gap: 20

        h2 {
            size: clamp(28, 4vw, 52)
            weight: 800
            text: var(--primary)
        }

        p {
            size: 18
            text: #7878a0
            max-width: 480
        }
    }

    .btn-row {
        flex
        row
        gap: 12
        margin-top: 8
    }

    .btn-primary {
        bg: var(--primary)
        text: var(--bg)
        border: none
        pad: 14 28
        radius: 12
        size: 15
        weight: 700
        pointer
        transition: smooth
        shadow: lifted

        &:hover {
            transform: translateY(-2px)
            shadow: glow
        }
    }

    .btn-ghost {
        bg: transparent
        text: var(--primary)
        border: 2 solid var(--primary)
        pad: 14 28
        radius: 12
        size: 15
        weight: 600
        pointer
        transition: smooth

        &:hover {
            bg: var(--primary)
            text: var(--bg)
        }
    }

    .cards {
        flex
        row
        wrap
        gap: 20
        margin-top: 40

        .card {
            bg: var(--surface)
            border: 1 solid var(--muted)
            pad: 28
            radius: 16
            flex: 1
            min-width: 200
            transition: smooth
            shadow: card

            &:hover {
                border: 1 solid var(--primary)
                transform: translateY(-4px)
                shadow: lifted
            }

            h3 {
                text: var(--primary)
                size: 18
                weight: 700
                margin-bottom: 8
            }

            p {
                text: #7878a0
                size: 14
            }
        }
    }

    #counter-box {
        flex
        column
        center
        pad: 40
        bg: var(--surface)
        radius: 20
        margin-top: 40
        gap: 16
        border: 1 solid var(--muted)

        #count {
            size: 64
            weight: 800
            text: var(--primary)
            transition: smooth
        }

        p {
            text: #7878a0
            size: 16
            margin: 0
        }

        button {
            bg: var(--muted)
            text: var(--text)
            border: none
            pad: 12 24
            radius: 10
            size: 16
            pointer
            transition: fast

            &:hover {
                bg: var(--primary)
                text: var(--bg)
                weight: 700
            }
        }
    }
}

script {

    let count = 0

    task updateCount() {
        put(count, "#count")
        let el = query("#count")
        tween(el, { transform: "scale(1.2)" }, 100)
        wait(120)
        tween(el, { transform: "scale(1)" }, 100)
    }

    on("#inc-btn", "click", () => {
        count = count + 1
        updateCount()
    })

    on("#dec-btn", "click", () => {
        count = count - 1
        updateCount()
    })

    on("#rst-btn", "click", () => {
        count = 0
        updateCount()
    })

    on("#primary-btn", "click", () => {
        html("#counter-box", \`
            <h2 id="count">\${count}</h2>
            <p>clicks</p>
            <button id="inc-btn" onclick="document.querySelector('#count').textContent=++count">+1</button>
            <button id="dec-btn" onclick="document.querySelector('#count').textContent=--count">-1</button>
            <button id="rst-btn" onclick="count=0;document.querySelector('#count').textContent=0">Reset</button>
        \`)
        show("#counter-box")
    })

    on("#nav-home",  "click", () => toggleClass("header", "scrolled"))
    on("#nav-about", "click", () => emit(document.body, "navigate", { page: "about" }))
}`,

  hello: `@import HTML body
@import Thread style

// Hello World — minimal chicken-nuget + Thread

page {
    div .center {
        h1 "Hello, World!"
        p  "Your first weave.web page."
        hr
        p  "Edit me in the editor →"
    }
}

style {

    body {
        bg: #0a0a0f
        text: white
        flex
        column
        center
        min-height: 100vh
        font-family: "Syne", sans-serif
    }

    .center {
        text-align: center
        flex
        column
        center
        gap: 16
        pad: 40

        h1 {
            size: 48
            weight: 800
            text: #6ee7b7
        }

        p {
            text: #7878a0
            size: 18
        }

        hr {
            border: 1 solid #2a2a40
            w: 200
            margin: 8 0
        }
    }
}`,

  weave: `@import JS ff

// Weave v2 — compiles to JavaScript
// All the new builtins in one demo

// ── DOM helpers ───────────────────────────────────────────────────────

task setupDOM() {

    // Dynamic HTML injection
    html("body", \`
        <div id="app" style="background:#080810;color:#e8e8f0;font-family:monospace;padding:40px;">
            <h1 id="title" style="color:#6ee7b7">Weave v2</h1>
            <p id="status">Click anything to test builtins</p>
            <button id="btn" style="background:#818cf8;color:#080810;border:none;padding:12px 24px;border-radius:10px;cursor:pointer;font-size:14px;margin:8px">
                Test DOM
            </button>
            <button id="async-btn" style="background:#6ee7b7;color:#080810;border:none;padding:12px 24px;border-radius:10px;cursor:pointer;font-size:14px;margin:8px">
                Fetch API
            </button>
            <button id="store-btn" style="background:#fb923c;color:#080810;border:none;padding:12px 24px;border-radius:10px;cursor:pointer;font-size:14px;margin:8px">
                LocalStorage
            </button>
            <div id="output" style="margin-top:24px;padding:20px;background:#0f0f1e;border-radius:12px;min-height:60px;white-space:pre-wrap;font-size:13px;color:#6ee7b7"></div>
        </div>
    \`)
}

task log(msg) {
    let el = query("#output")
    el.textContent = el.textContent + "\\n" + msg
    say(msg)
}

// ── Basic DOM test ─────────────────────────────────────────────────

task testDOM() {

    // show / hide / toggle
    show("#title")
    log("✓ show() works")

    // addClass / removeClass / toggleClass
    attr("#btn", "disabled", true)
    wait(500)
    attr("#btn", "disabled", false)
    log("✓ attr() works")

    // style()
    style("#title", "color", "#fb923c")
    wait(800)
    style("#title", "color", "#6ee7b7")
    log("✓ style() works")

    // tween
    let titleEl = query("#title")
    tween(titleEl, { transform: "scale(1.3)" }, 200)
    wait(300)
    tween(titleEl, { transform: "scale(1)" }, 200)
    log("✓ tween() works")

    put("All DOM tests passed! ✓", "#status")
}

// ── Async fetch test ───────────────────────────────────────────────

task testFetch() {
    put("Fetching...", "#status")
    let data = await get("https://jsonplaceholder.typicode.com/todos/1")
    log("✓ get() fetched: " + data.title)
    put("Fetched: " + data.title, "#status")
}

// ── LocalStorage test ──────────────────────────────────────────────

task testStore() {
    store("visits", (parseInt(get("visits") || "0") + 1).toString())
    let v = get("visits")
    log("✓ store()/get() — visit count: " + v)
    put("Stored visit count: " + v, "#status")
}

// ── Repeat helper ──────────────────────────────────────────────────

task countUp() {
    repeat(5, (i) => {
        wait(i * 200)
        log("Repeat step: " + (i + 1))
    })
}

// ── Event emitter ─────────────────────────────────────────────────

task watchTest() {
    emit(document.body, "weave-ready", { version: 2 })
}

// ── Init ──────────────────────────────────────────────────────────

setupDOM()

on("#btn",       "click", testDOM)
on("#async-btn", "click", testFetch)
on("#store-btn", "click", testStore)

document.body.addEventListener("weave-ready", (e) => {
    log("Custom event received: " + JSON.stringify(e.detail))
})

wait(100)
watchTest()
say("Weave v2 — ready")`,

  thread: `@import Thread style

// Thread v2 — Advanced CSS demo
// Variables, nesting, pseudo-classes, @media, @keyframes, gradient, glass

@keyframes float {
    0%   { transform: translateY(0px) }
    50%  { transform: translateY(-12px) }
    100% { transform: translateY(0px) }
}

@keyframes fadeIn {
    from { opacity: 0  transform: translateY(20px) }
    to   { opacity: 1  transform: translateY(0px)  }
}

@keyframes shimmer {
    0%   { background-position: -200% center }
    100% { background-position:  200% center }
}

style {

    --primary:  #6ee7b7
    --accent:   #818cf8
    --pink:     #f472b6
    --bg:       #080810
    --surface:  #0f0f1e
    --border:   #1e1e3a

    body {
        bg: var(--bg)
        text: white
        font-family: "Syne", sans-serif
        pad: 40
        min-height: 100vh
        flex
        column
        gap: 32
        align-items: center
    }

    h1 {
        size: clamp(28, 5vw, 56)
        weight: 800
        gradient: neon
        animate: fadeIn 0.6s ease
        text-align: center
    }

    .demo-grid {
        flex
        row
        wrap
        gap: 20
        max-width: 900
        w: 100%
        justify-content: center
    }

    .card {
        bg: var(--surface)
        border: 1 solid var(--border)
        pad: 28
        radius: 20
        min-width: 220
        flex: 1
        shadow: card
        transition: smooth
        animate: fadeIn 0.5s ease

        &:hover {
            border: 1 solid var(--primary)
            shadow: glow
            transform: translateY(-6px)
        }

        .card-title {
            size: 18
            weight: 700
            text: var(--primary)
            margin-bottom: 10
        }

        .card-body {
            size: 14
            text: #7878a0
            line-height: 1.6
        }
    }

    .glass-card {
        glass
        radius: 20
        pad: 32
        min-width: 240
        flex: 1

        &:hover {
            transform: translateY(-4px)
        }
    }

    .float-badge {
        bg: var(--accent)
        text: white
        pad: 8 20
        rounded
        size: 14
        weight: 700
        animate: float 3s ease-in-out infinite
        shadow: glow
        display: inline-block
    }

    .shimmer-text {
        size: 24
        weight: 800
        background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 25%, var(--pink) 50%, var(--accent) 75%, var(--primary) 100%)
        background-size: 200% auto
        -webkit-background-clip: text
        -webkit-text-fill-color: transparent
        animate: shimmer 3s linear infinite
    }

    button {
        bg: var(--primary)
        text: var(--bg)
        border: none
        pad: 12 24
        radius: 10
        size: 14
        weight: 700
        pointer
        transition: fast
        shadow: lifted

        &:hover {
            transform: translateY(-2px) scale(1.05)
            shadow: glow
        }

        &:active {
            transform: scale(0.97)
        }
    }

    @media (max-width: 600px) {
        body {
            pad: 20
        }

        h1 {
            size: 32
        }

        .demo-grid {
            flex-direction: column
        }
    }
}`,

  hybrid: `@import HTML body
@import Thread style
@import JS ff

// ── Score game — full hybrid v2 ───────────────────────────────────────

page Game {

    div #game {

        header .game-header {
            h1 "Score: 0"
            p  #streak "Streak: 0 🔥"
        }

        section .game-area {
            div .target-zone {
                button #target .target "🎯 Click me!"
            }
            div .controls {
                button #speed-btn .ctrl-btn "⚡ Speed: Normal"
                button #reset-btn .ctrl-btn "↺ Reset"
            }
        }

        section .stats-bar {
            div .stat {
                h3 #high-score "0"
                p "High Score"
            }
            div .stat {
                h3 #click-rate "0"
                p "Clicks/sec"
            }
            div .stat {
                h3 #time-left "30"
                p "Seconds"
            }
        }

        div #message ""
    }
}

style {

    --primary: #6ee7b7
    --accent:  #818cf8
    --bg:      #080810
    --surface: #0f0f1e

    body {
        bg: var(--bg)
        text: white
        font-family: "Syne", sans-serif
        flex
        column
        center
        min-height: 100vh
        margin: 0
    }

    #game {
        w: 100%
        max-width: 700
        pad: 32
        flex
        column
        gap: 24
    }

    .game-header {
        text-align: center

        h1 {
            size: 40
            weight: 800
            text: var(--primary)
        }

        #streak {
            text: #fb923c
            size: 16
            margin: 4 0 0
        }
    }

    .target-zone {
        flex
        column
        center
        min-height: 200
        bg: var(--surface)
        radius: 20
        border: 2 solid #1e1e3a
        position: relative
        overflow: hidden
    }

    .target {
        bg: var(--accent)
        text: white
        border: none
        pad: 20 36
        radius: 50
        size: 20
        weight: 700
        pointer
        transition: fast
        shadow: glow
        position: absolute

        &:hover {
            transform: scale(1.1)
        }

        &:active {
            transform: scale(0.92)
        }
    }

    .controls {
        flex
        row
        gap: 12
        justify-content: center
        margin-top: 16
    }

    .ctrl-btn {
        bg: var(--surface)
        text: var(--primary)
        border: 1 solid #2a2a40
        pad: 10 20
        radius: 10
        size: 14
        pointer
        transition: fast

        &:hover {
            border: 1 solid var(--primary)
            bg: var(--primary)
            text: var(--bg)
        }
    }

    .stats-bar {
        flex
        row
        gap: 16
        justify-content: center

        .stat {
            bg: var(--surface)
            pad: 20 28
            radius: 14
            text-align: center
            flex: 1
            border: 1 solid #1e1e3a

            h3 {
                size: 32
                weight: 800
                text: var(--primary)
                margin-bottom: 4
            }

            p {
                text: #7878a0
                size: 13
            }
        }
    }

    #message {
        text-align: center
        size: 22
        weight: 700
        text: #fb923c
        min-height: 36
        transition: smooth
    }
}

script {

    let score   = 0
    let streak  = 0
    let high    = parseInt(store("highscore") || "0")
    let running = false
    let timer   = null
    let timeLeft = 30
    let lastClick = 0
    let clicks  = []
    let speed   = 1

    task startGame() {
        if (running) return
        running  = true
        timeLeft = 30
        score    = 0
        streak   = 0
        clicks   = []
        put("0",  "h1")
        put("0",  "#high-score")
        put("30", "#time-left")
        put("",   "#message")
        moveTarget()

        timer = setInterval(() => {
            timeLeft--
            put(timeLeft, "#time-left")

            // Calc click rate
            let now = Date.now()
            clicks = clicks.filter(t => now - t < 1000)
            put(clicks.length, "#click-rate")

            if (timeLeft <= 0) {
                clearInterval(timer)
                running = false
                endGame()
            }
        }, 1000)
    }

    task moveTarget() {
        if (!running) return
        let zone = query(".target-zone")
        let btn  = query(".target")
        let zw   = zone.offsetWidth  - 120
        let zh   = zone.offsetHeight - 60
        let x    = Math.random() * zw
        let y    = Math.random() * zh
        style(".target", "left",   x + "px")
        style(".target", "top",    y + "px")
    }

    task endGame() {
        hide(".target")
        if (score > high) {
            high = score
            store("highscore", high.toString())
            put("🏆 New High Score: " + high, "#message")
        } else {
            put("Game Over! Score: " + score, "#message")
        }
        put(high, "#high-score")
        wait(2000)
        show(".target")
    }

    on(".target", "click", () => {
        if (!running) startGame()

        score++
        streak++
        clicks.push(Date.now())

        put("Score: " + score,       "h1")
        put("Streak: " + streak + " 🔥", "#streak")
        put(Math.max(score, high),    "#high-score")

        moveTarget()

        // Visual flash
        style("h1", "color", "#fb923c")
        wait(150)
        style("h1", "color", "#6ee7b7")
    })

    on("#reset-btn", "click", () => {
        clearInterval(timer)
        running = false
        score   = 0
        streak  = 0
        timeLeft = 30
        put("Score: 0", "h1")
        put("Streak: 0 🔥", "#streak")
        put("30", "#time-left")
        put("0",  "#click-rate")
        put("Click the target to start!", "#message")
        show(".target")
        moveTarget()
    })

    on("#speed-btn", "click", () => {
        speed = speed >= 3 ? 1 : speed + 1
        let labels = ["Normal", "Fast", "Insane"]
        put("⚡ Speed: " + labels[speed - 1], "#speed-btn")
    })

    // Init
    put(high, "#high-score")
    put("Click the target to start!", "#message")
    moveTarget()
}`
}

// ── VIRTUAL FILE SYSTEM ───────────────────────────────────────────────

Object.keys(EXAMPLES).forEach(k => {
  const names = { main:'app.web', hello:'hello.web', weave:'counter.web', thread:'theme.web', hybrid:'game.web' }
  VFS[names[k] || k + '.web'] = EXAMPLES[k]
})

// ── GLOBALS ───────────────────────────────────────────────────────────

var editor          = null
var lastCompiledHTML = ''
var showingOutput   = false
var aiOpen          = false
var compileErrors   = []
var decorations     = []

// ── MONACO SETUP ──────────────────────────────────────────────────────

require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' } })

require(['vs/editor/editor.main'], function () {

  monaco.languages.register({ id: 'weave' })

  monaco.languages.setMonarchTokensProvider('weave', {
    tokenizer: {
      root: [
        [/@[a-z]+\b.*$/,                                                           'keyword.directive'],
        [/\/\/.*/,                                                                  'comment'],
        [/\/\*[\s\S]*?\*\//,                                                       'comment'],
        [/\b(page|style|script|component|slot)\b/,                                 'keyword.block'],
        [/\b(task|let|const|var|return|if|else|for|while|class|new|try|catch|finally|async|await|import|export)\b/, 'keyword.control'],
        [/\b(say|put|show|hide|toggle|addClass|removeClass|toggleClass|attr|getAttr|html|style|query|queryAll|emit|watch|store|get|post|route|repeat|wait|tween|on|load|ping)\b/, 'keyword.builtin'],
        [/\b(h[1-6]|p|div|span|button|input|a|section|nav|header|footer|main|ul|ol|li|table|tr|td|th|thead|tbody|form|label|select|option|textarea|img|hr|br|article|aside|figure)\b/, 'tag'],
        [/\b(flex|row|column|center|wrap|rounded|pointer|bold|italic|block|none|grid|sticky|hidden|ellipsis|scroll|glass|glow|uppercase|relative|absolute|fixed|nowrap|inline)\b/, 'keyword.shorthand'],
        [/\b(bg|text|pad|radius|size|weight|shadow|margin|gap|border|w|h|align|opacity|overflow|transform|transition|z|display|cursor|gradient|animate)\b/,                     'keyword.alias'],
        [/--[\w-]+/,                                                                'variable'],
        [/"[^"]*"/,                                                                 'string'],
        [/'[^']*'/,                                                                 'string'],
        [/`[^`]*`/,                                                                 'string'],
        [/#[\w-]+/,                                                                 'type'],
        [/\.[\w-]+/,                                                                'tag.class'],
        [/\d+(\.\d+)?/,                                                             'number'],
        [/[{}]/,                                                                    'delimiter.bracket'],
        [/[()]/,                                                                    'delimiter.paren'],
        [/[@]/,                                                                     'keyword.directive'],
        [/[=><+\-*\/!&|?:]/,                                                        'operator'],
      ]
    }
  })

  monaco.editor.defineTheme('weave-dark', {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'keyword.directive', foreground: '818cf8', fontStyle: 'italic' },
      { token: 'keyword.block',     foreground: 'c084fc', fontStyle: 'bold'   },
      { token: 'keyword.control',   foreground: '818cf8'                       },
      { token: 'keyword.builtin',   foreground: '38bdf8', fontStyle: 'bold'   },
      { token: 'keyword.shorthand', foreground: 'fb923c'                       },
      { token: 'keyword.alias',     foreground: 'fbbf24'                       },
      { token: 'tag',               foreground: '6ee7b7'                       },
      { token: 'tag.class',         foreground: '4ade80'                       },
      { token: 'variable',          foreground: 'f472b6'                       },
      { token: 'string',            foreground: 'a3e635'                       },
      { token: 'type',              foreground: '38bdf8'                       },
      { token: 'number',            foreground: 'fb923c'                       },
      { token: 'operator',          foreground: 'e879f9'                       },
      { token: 'comment',           foreground: '2d2d50', fontStyle: 'italic'  },
    ],
    colors: {
      'editor.background':                 '#080810',
      'editor.foreground':                 '#e8e8f0',
      'editorLineNumber.foreground':       '#1e1e35',
      'editorLineNumber.activeForeground': '#4a4a6a',
      'editor.selectionBackground':        '#1e1e4088',
      'editor.lineHighlightBackground':    '#0d0d1a',
      'editorCursor.foreground':           '#6ee7b7',
      'editorIndentGuide.background':      '#1e1e2f',
    }
  })

  // Autocomplete provider
  monaco.languages.registerCompletionItemProvider('weave', {
    provideCompletionItems: function(model, position) {
      var word    = model.getWordUntilPosition(position)
      var range   = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn }
      var source  = model.getValue()
      var imports = parseImports(source)

      var items = []

      // Always suggest @import + Weave keywords
      var baseItems = [
        // Directives
        { label: '@import HTML body',   kind: 14, insertText: '@import HTML body',   detail: 'chicken-nuget HTML block' },
        { label: '@import Thread style',kind: 14, insertText: '@import Thread style', detail: 'Thread CSS block' },
        { label: '@import JS ff',       kind: 14, insertText: '@import JS ff',        detail: 'Weave JS block' },
      ]

      // HTML completions
      if (imports.HTML) {
        var htmlItems = [
          { label:'page',    insertText:'page ${1:Name} {\n\t$0\n}',      kind:6  },
          { label:'div',     insertText:'div ${1:#id} {\n\t$0\n}',        kind:6  },
          { label:'section', insertText:'section ${1:.class} {\n\t$0\n}', kind:6  },
          { label:'h1',      insertText:'h1 "${1:Title}"',                 kind:6  },
          { label:'h2',      insertText:'h2 "${1:Subtitle}"',              kind:6  },
          { label:'p',       insertText:'p "${1:Text}"',                   kind:6  },
          { label:'button',  insertText:'button #${1:id} "${1:Label}"',    kind:6  },
          { label:'input',   insertText:'input #${1:id} "${1:placeholder}"', kind:6  },
          { label:'img',     insertText:'img src="${1:url}" alt="${2:desc}"', kind:6 },
          { label:'a',       insertText:'a "${1:Text}" href="${2:url}"',   kind:6  },
          { label:'ul',      insertText:'ul {\n\tli "${1:Item}"\n}',       kind:6  },
          { label:'form',    insertText:'form #${1:id} {\n\t$0\n}',       kind:6  },
          { label:'select',  insertText:'select #${1:id} {\n\toption "${1:value}" "${1:Label}"\n}', kind:6 },
          { label:'component',insertText:'component ${1:Name} {\n\t$0\n}',kind:6  },
          { label:'slot',    insertText:'slot "${1:name}"',                kind:6  },
        ].map(i => ({ ...i, insertTextRules: 4, range }))
        items = items.concat(htmlItems)
      }

      // CSS completions
      if (imports.Thread) {
        var cssItems = [
          'bg', 'text', 'pad', 'radius', 'size', 'weight', 'shadow', 'margin',
          'gap', 'border', 'w', 'h', 'align', 'opacity', 'overflow', 'transform',
          'transition', 'z', 'gradient', 'animate',
          'flex', 'row', 'column', 'center', 'wrap', 'rounded', 'pointer',
          'bold', 'italic', 'glass', 'glow', 'sticky', 'hidden', 'ellipsis'
        ].map(k => ({ label: k, insertText: k, kind: 9, range }))

        var cssSnippets = [
          { label: 'shadow: soft',     insertText: 'shadow: soft',                                    kind:14, range },
          { label: 'shadow: glow',     insertText: 'shadow: glow',                                    kind:14, range },
          { label: 'transition: smooth',insertText: 'transition: smooth',                             kind:14, range },
          { label: 'gradient: neon',   insertText: 'gradient: neon',                                  kind:14, range },
          { label: '@keyframes',       insertText: '@keyframes ${1:name} {\n\tfrom { $2 }\n\tto { $3 }\n}', insertTextRules:4, kind:14, range },
          { label: '@media mobile',    insertText: '@media (max-width: 768px) {\n\t$0\n}',            insertTextRules:4, kind:14, range },
          { label: '&:hover',          insertText: '&:hover {\n\t$0\n}',                              insertTextRules:4, kind:14, range },
          { label: 'var()',            insertText: 'var(--${1:name})',                                 insertTextRules:4, kind:14, range },
          { label: 'clamp()',          insertText: 'clamp(${1:min}, ${2:val}, ${3:max})',              insertTextRules:4, kind:14, range },
        ]
        items = items.concat(cssItems, cssSnippets)
      }

      // JS completions
      if (imports.JS) {
        var jsItems = [
          { label:'task',        insertText:'task ${1:name}(${2:args}) {\n\t$0\n}',        insertTextRules:4, kind:2, detail:'function' },
          { label:'say',         insertText:'say(${1:value})',                               insertTextRules:4, kind:2, detail:'console.log' },
          { label:'put',         insertText:'put(${1:value}, "${2:#selector}")',             insertTextRules:4, kind:2, detail:'set textContent' },
          { label:'html',        insertText:'html("${1:#selector}", `${2:markup}`)',         insertTextRules:4, kind:2, detail:'set innerHTML' },
          { label:'on',          insertText:'on("${1:#selector}", "${2:event}", ${3:handler})',insertTextRules:4, kind:2, detail:'addEventListener' },
          { label:'show',        insertText:'show("${1:#selector}")',                        insertTextRules:4, kind:2 },
          { label:'hide',        insertText:'hide("${1:#selector}")',                        insertTextRules:4, kind:2 },
          { label:'toggle',      insertText:'toggle("${1:#selector}")',                      insertTextRules:4, kind:2 },
          { label:'addClass',    insertText:'addClass("${1:#sel}", "${2:cls}")',              insertTextRules:4, kind:2 },
          { label:'removeClass', insertText:'removeClass("${1:#sel}", "${2:cls}")',           insertTextRules:4, kind:2 },
          { label:'toggleClass', insertText:'toggleClass("${1:#sel}", "${2:cls}")',           insertTextRules:4, kind:2 },
          { label:'attr',        insertText:'attr("${1:#sel}", "${2:name}", ${3:value})',     insertTextRules:4, kind:2 },
          { label:'getAttr',     insertText:'getAttr("${1:#sel}", "${2:name}")',              insertTextRules:4, kind:2 },
          { label:'style',       insertText:'style("${1:#sel}", "${2:prop}", "${3:val}")',    insertTextRules:4, kind:2 },
          { label:'query',       insertText:'query("${1:#sel}")',                             insertTextRules:4, kind:2 },
          { label:'queryAll',    insertText:'queryAll("${1:#sel}")',                          insertTextRules:4, kind:2 },
          { label:'emit',        insertText:'emit(${1:element}, "${2:event}", { ${3:data} })',insertTextRules:4, kind:2 },
          { label:'store',       insertText:'store("${1:key}", ${2:value})',                  insertTextRules:4, kind:2 },
          { label:'get (store)', insertText:'get("${1:key}")',                                insertTextRules:4, kind:2, detail:'localStorage.getItem' },
          { label:'get (fetch)', insertText:'await get("${1:url}")',                          insertTextRules:4, kind:2, detail:'JSON GET fetch' },
          { label:'post',        insertText:'await post("${1:url}", { ${2:data} })',          insertTextRules:4, kind:2, detail:'JSON POST fetch' },
          { label:'wait',        insertText:'await wait(${1:ms})',                            insertTextRules:4, kind:2, detail:'Promise sleep' },
          { label:'repeat',      insertText:'repeat(${1:n}, (i) => {\n\t$0\n})',             insertTextRules:4, kind:2 },
          { label:'tween',       insertText:'tween(${1:element}, { ${2:props} }, ${3:ms})',  insertTextRules:4, kind:2 },
          { label:'route',       insertText:'route("${1:/path}", () => {\n\t$0\n})',         insertTextRules:4, kind:2 },
          { label:'load',        insertText:'await load("${1:url}")',                         insertTextRules:4, kind:2, detail:'fetch JSON' },
          { label:'ping',        insertText:'await ping("${1:url}")',                         insertTextRules:4, kind:2 },
        ].map(i => ({ ...i, range }))
        items = items.concat(jsItems)
      }

      return { suggestions: items.concat(baseItems.map(i => ({ ...i, insertTextRules: 0, range }))) }
    }
  })

  editor = monaco.editor.create(document.getElementById('editor'), {
    value:    VFS['app.web'],
    language: 'weave',
    theme:    'weave-dark',
    automaticLayout:    true,
    fontFamily:         "'JetBrains Mono', monospace",
    fontSize:           13,
    lineHeight:         22,
    minimap:            { enabled: false },
    scrollBeyondLastLine: false,
    renderLineHighlight:'gutter',
    cursorBlinking:     'smooth',
    smoothScrolling:    true,
    padding:            { top: 16, bottom: 16 },
    wordWrap:           'off',
    tabSize:            4,
    insertSpaces:       true,
    suggestOnTriggerCharacters: true,
    quickSuggestions:   { other: true, comments: false, strings: false },
    acceptSuggestionOnCommitCharacter: true,
  })

  editor.onDidChangeCursorPosition(function (e) {
    document.getElementById('lineColStatus').textContent =
      'Ln ' + e.position.lineNumber + ', Col ' + e.position.column
  })

  // Save to VFS on change
  var compileTimer
  editor.onDidChangeModelContent(function () {
    VFS[activeFile] = editor.getValue()
    clearTimeout(compileTimer)
    compileTimer = setTimeout(compileAndPreview, 600)
  })

  // Ctrl+S to save + format trigger
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
    VFS[activeFile] = editor.getValue()
    compileAndPreview()
    setStatus('ok', 'Saved & compiled')
  })

  // Ctrl+K inline AI
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, function () {
    var selection = editor.getSelection()
    var text = editor.getModel().getValueInRange(selection)
    if (text) {
      document.getElementById('aiPrompt').value = 'Rewrite this selection:\n' + text
    }
    toggleAI(true)
    setTimeout(() => document.getElementById('aiPrompt').focus(), 100)
  })

  compileAndPreview()
})

// ══════════════════════════════════════════════════════════════════════
//   COMPILER v2
// ══════════════════════════════════════════════════════════════════════

function parseImports(source) {
  var imports = {}
  var re = /^@[a-z]+\s+(\w+)\s+(\w+)/gim, m
  while ((m = re.exec(source)) !== null) imports[m[1]] = m[2]
  return imports
}

function compileWeave(source) {
  var imports = parseImports(source)
  var hasHTML   = !!imports.HTML
  var hasThread = !!imports.Thread
  var hasJS     = !!imports.JS

  var body = source.replace(/^@[a-z]+\s+\w+\s+\w+\s*$/gim, '').trim()

  var title    = 'weave.web'
  var bodyHTML = ''
  var cssOut   = ''
  var jsOut    = ''
  var components = {}

  // ── chicken-nuget HTML ──────────────────────────────────────────
  if (hasHTML) {
    // Extract components first
    var compRe = /component\s+(\w+)\s*\{/g, cm
    while ((cm = compRe.exec(body)) !== null) {
      var compContent = extractBlock(body, new RegExp('component\\s+' + cm[1] + '\\s*\\{'))
      if (compContent !== null) components[cm[1]] = compContent
    }
    // Remove component definitions from body
    body = body.replace(/component\s+\w+\s*\{[\s\S]*?\n\}/g, '')

    var pageM = body.match(/page(?:\s+\w+)?\s*\{([\s\S]*)\}[\s]*$/)
    if (pageM) {
      var pageContent = pageM[1]
      var titleM = pageContent.match(/title\s+"([^"]+)"/)
      if (titleM) title = titleM[1]
      bodyHTML = compileHTMLBlock(pageContent, components)
    }
  }

  // ── Thread CSS ──────────────────────────────────────────────────
  if (hasThread) {
    var styleBlock = extractBlock(body, /\bstyle\s*\{/)
    if (styleBlock !== null) cssOut = compileThreadBlock(styleBlock)
    else if (!hasHTML && !hasJS) cssOut = compileThreadBlock(body) // pure Thread file
  }

  // ── Weave JS ────────────────────────────────────────────────────
  if (hasJS) {
    var scriptBlock = extractBlock(body, /\bscript\s*\{/)
    if (scriptBlock !== null) jsOut = compileWeaveBlock(scriptBlock)
    else if (!hasHTML && !hasThread) jsOut = compileWeaveBlock(body) // pure Weave file
  }

  // ── Pure modes ─────────────────────────────────────────────────
  if (!hasHTML && !hasThread && hasJS) return buildJSOnlyPage(compileWeaveBlock(body))
  if (!hasHTML && hasThread && !hasJS) return buildThreadPreviewPage(compileThreadBlock(
    extractBlock(body, /\bstyle\s*\{/) !== null ? extractBlock(body, /\bstyle\s*\{/) : body
  ))

  return buildFullPage(title, bodyHTML, cssOut, jsOut)
}

// ── Block extractor ────────────────────────────────────────────────

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

// ══════════════════════════════════════════════════════════════════════
//   HTML / CHICKEN-NUGET COMPILER v2
// ══════════════════════════════════════════════════════════════════════

function compileHTMLBlock(content, components) {
  components = components || {}
  // Parse the block as a tree of tokens
  return parseHTMLContent(content.trim(), components)
}

function parseHTMLContent(content, components) {
  var lines  = tokenizeHTMLLines(content)
  var result = ''
  var i = 0

  while (i < lines.length) {
    var line = lines[i].trim()
    if (!line || line.startsWith('//') || line.startsWith('title ')) { i++; continue }

    // Check for block element (has nested { ... })
    var blockResult = tryParseHTMLBlock(lines, i, components)
    if (blockResult !== null) {
      result += blockResult.html
      i = blockResult.nextIndex
      continue
    }

    // Inline element
    result += parseHTMLInline(line, components)
    i++
  }
  return result
}

function tokenizeHTMLLines(content) {
  // Flatten brace-based blocks into indented lines for easier parsing
  var lines = []
  var src   = content.split('\n')
  for (var i = 0; i < src.length; i++) {
    var l = src[i]
    if (l.trim() === '{') {
      lines.push('{')
    } else if (l.trim() === '}') {
      lines.push('}')
    } else {
      lines.push(l)
    }
  }
  return lines
}

function tryParseHTMLBlock(lines, i, components) {
  // Look ahead: does lines[i] end with { or does lines[i+1] === '{'?
  var line = lines[i] ? lines[i].trim() : ''
  var hasOpenBrace = line.endsWith('{')
  var nextIsOpen   = (lines[i+1] && lines[i+1].trim() === '{')

  if (!hasOpenBrace && !nextIsOpen) return null

  var tagLine = hasOpenBrace ? line.slice(0, -1).trim() : line
  var startI  = hasOpenBrace ? i : i + 1  // index of the {

  // Collect inner content until matching }
  var depth    = 1
  var innerLines = []
  var j = startI + 1

  while (j < lines.length && depth > 0) {
    var l = lines[j].trim()
    if (l === '{' || l.endsWith('{')) { depth++; if (depth > 1) innerLines.push(lines[j]) }
    else if (l === '}') { depth--; if (depth > 0) innerLines.push(lines[j]) }
    else innerLines.push(lines[j])
    j++
  }

  var innerContent = innerLines.join('\n')
  var innerHTML    = parseHTMLContent(innerContent, components)
  var tag          = buildHTMLTag(tagLine, innerHTML, components)

  return { html: tag, nextIndex: j }
}

function parseHTMLInline(line, components) {
  if (!line) return ''

  // hr / br (void)
  if (line === 'hr') return '<hr>\n'
  if (line === 'br') return '<br>\n'

  // img src="url" alt="desc"
  var imgM = line.match(/^img\s+src="([^"]+)"(?:\s+alt="([^"]*)")?/)
  if (imgM) return '<img src="' + imgM[1] + '" alt="' + (imgM[2] || '') + '">\n'

  // slot "name"
  var slotM = line.match(/^slot\s+"([^"]+)"$/)
  if (slotM) return '<!-- slot: ' + slotM[1] + ' -->\n'

  // Component usage: <ComponentName />  or  ComponentName
  if (components && /^[A-Z]/.test(line.split(/\s/)[0])) {
    var cname = line.split(/\s/)[0]
    if (components[cname]) {
      return '<div class="component-' + cname.toLowerCase() + '">' + parseHTMLContent(components[cname], components) + '</div>\n'
    }
  }

  return buildHTMLTag(line, '', components)
}

function buildHTMLTag(tagLine, innerHTML, components) {
  if (!tagLine) return innerHTML || ''

  // Parse: tagName [#id] [.class1.class2] [attrs] ["text"]
  // Also support: tagName .class1.class2 #id [attrs] ["text"]
  var tag     = ''
  var id      = ''
  var classes = []
  var attrs   = {}
  var text    = ''

  var rem = tagLine.trim()

  // Extract tag name
  var tagM = rem.match(/^([\w-]+)/)
  if (!tagM) return ''
  tag = tagM[1]
  rem = rem.slice(tag.length).trim()

  // Tag aliases
  var tagMap = { strong:'strong', em:'em', code:'code', pre:'pre', small:'small', mark:'mark' }
  tag = tagMap[tag] || tag

  // Extract id(s) — #id
  rem = rem.replace(/#([\w-]+)/g, function(_, i) { id = i; return '' }).trim()

  // Extract classes — .cls1.cls2 or .cls1 .cls2
  rem = rem.replace(/\.([\w-]+)/g, function(_, c) { classes.push(c); return '' }).trim()

  // Extract key=value attrs
  rem = rem.replace(/([\w-]+)="([^"]*)"/g, function(_, k, v) { attrs[k] = v; return '' })
           .replace(/([\w-]+)=(\S+)/g,     function(_, k, v) { attrs[k] = v; return '' })
  rem = rem.trim()

  // Remaining string = text
  var textM = rem.match(/^"([^"]*)"$/)
  if (textM) text = textM[1]

  // Build attr string
  var attrStr = ''
  if (id)             attrStr += ' id="' + id + '"'
  if (classes.length) attrStr += ' class="' + classes.join(' ') + '"'
  Object.keys(attrs).forEach(function(k) { attrStr += ' ' + k + '="' + attrs[k] + '"' })

  // Void elements
  var voids = { input:1, img:1, hr:1, br:1, meta:1, link:1, source:1, wbr:1 }
  if (voids[tag]) return '<' + tag + attrStr + '>\n'

  var inner = innerHTML || esc(text)
  if (!inner && !innerHTML) inner = ''

  return '<' + tag + attrStr + '>' + inner + '</' + tag + '>\n'
}

// ══════════════════════════════════════════════════════════════════════
//   THREAD CSS COMPILER v2
// ══════════════════════════════════════════════════════════════════════

var THREAD_ALIASES = {
  bg:'background', text:'color', radius:'border-radius', size:'font-size',
  weight:'font-weight', pad:'padding', margin:'margin', w:'width', h:'height',
  align:'text-align', gap:'gap', border:'border', opacity:'opacity',
  overflow:'overflow', transform:'transform', transition:'transition',
  z:'z-index', display:'display', cursor:'cursor', gradient:'background',
  animate:'animation', shadow:'box-shadow'
}

var THREAD_PRESETS = {
  shadow: {
    soft:   '0 4px 12px rgba(0,0,0,0.15)',
    hard:   '0 8px 30px rgba(0,0,0,0.4)',
    glow:   '0 0 20px rgba(110,231,183,0.4)',
    lifted: '0 8px 24px rgba(0,0,0,0.3)',
    card:   '0 2px 8px rgba(0,0,0,0.2)',
    none:   'none'
  },
  transition: {
    fast:   'all 0.15s ease',
    smooth: 'all 0.3s ease',
    slow:   'all 0.6s ease',
    bounce: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  gradient: {
    sunset: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)',
    ocean:  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    forest: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)',
    neon:   'linear-gradient(135deg, #6ee7b7 0%, #818cf8 50%, #f472b6 100%)',
    dusk:   'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
  }
}

var GRADIENT_TEXT_NAMES = ['sunset','ocean','forest','neon','dusk']

var THREAD_NUMERIC = [
  'padding','margin','border-radius','font-size','width','height','gap',
  'min-height','max-width','min-width','line-height','letter-spacing',
  'top','left','right','bottom','z-index'
]

function compileThreadBlock(source) {
  // Extract @keyframes and @media before main parse
  var keyframes = []
  var mediaq    = []

  source = source.replace(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?)(?=\n@|\n[a-zA-Z#&*.\[:]|\Z)/g, function(m, name, body) {
    keyframes.push('@keyframes ' + name + ' {' + compileKeyframeBody(body) + '\n}')
    return ''
  })

  // Extract CSS variables at top level
  var cssVars = ''
  source = source.replace(/--[\w-]+\s*:\s*[^\n]+/g, function(m) {
    cssVars += '  ' + m.trim() + ';\n'
    return ''
  })
  if (cssVars) cssVars = ':root {\n' + cssVars + '}\n\n'

  // Extract @media blocks
  source = source.replace(/@media\s*([^{]+)\s*\{([\s\S]*?)\n\}/g, function(m, query, body) {
    var innerAst  = parseThreadAST(body)
    var innerCSS  = ''
    for (var i = 0; i < innerAst.length; i++) innerCSS += renderThreadRule(innerAst[i], '', true)
    mediaq.push('@media ' + query.trim() + ' {\n' + innerCSS + '}\n')
    return ''
  })

  var ast = parseThreadAST(source)
  var css = cssVars
  for (var i = 0; i < ast.length; i++) css += renderThreadRule(ast[i], '', false)
  css += keyframes.join('\n\n') + '\n'
  css += mediaq.join('\n')
  return css
}

function compileKeyframeBody(body) {
  var css = ''
  var lines = body.split('\n').map(function(l){ return l.trim() }).filter(Boolean)
  var i = 0
  while (i < lines.length) {
    var line = lines[i]
    if (line.endsWith('{')) {
      var sel = line.slice(0,-1).trim()
      var props = ''
      i++
      while (i < lines.length && lines[i] !== '}') {
        var colon = lines[i].indexOf(':')
        if (colon > 0) {
          var k = lines[i].slice(0,colon).trim()
          var v = lines[i].slice(colon+1).trim()
          props += '    ' + (THREAD_ALIASES[k] || k) + ': ' + v + ';\n'
        }
        i++
      }
      css += '\n  ' + sel + ' {\n' + props + '  }'
    }
    i++
  }
  return css
}

function parseThreadAST(source) {
  var lines = source.split('\n').map(function(l){ return l.trim() })
                    .filter(function(l){ return l && !l.startsWith('//') })
  var ast   = [], stack = []

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (line === '}') { stack.pop(); continue }
    if (line.endsWith('{')) {
      var sel  = line.slice(0,-1).trim()
      var node = { selector:sel, properties:[], children:[] }
      if (stack.length === 0) ast.push(node)
      else stack[stack.length-1].children.push(node)
      stack.push(node)
      continue
    }
    if (stack.length === 0) continue
    var colon = line.indexOf(':')
    if (colon > 0) stack[stack.length-1].properties.push({ key:line.slice(0,colon).trim(), value:line.slice(colon+1).trim() })
    else            stack[stack.length-1].properties.push({ key:line, value:true })
  }
  return ast
}

function renderThreadRule(rule, parent, inMedia) {
  var sel = rule.selector

  // Handle & parent reference
  if (sel.startsWith('&')) {
    sel = parent ? parent + sel.slice(1) : sel.slice(1)
  } else {
    sel = parent ? parent + ' ' + sel : sel
  }

  var css = sel + ' {\n'
  var extraCSS = ''  // for gradient text
  var isGradientText = false

  for (var i = 0; i < rule.properties.length; i++) {
    var result = renderThreadProperty(rule.properties[i].key, rule.properties[i].value, sel)
    if (result.extra) extraCSS += result.extra
    css += result.css
  }
  css += '}\n\n'

  if (extraCSS) css = extraCSS + css

  for (var j = 0; j < rule.children.length; j++) {
    css += renderThreadRule(rule.children[j], sel, inMedia)
  }
  return css
}

function renderThreadProperty(key, value, selector) {
  var shorthands = {
    flex:      { css:'  display: flex;\n' },
    row:       { css:'  flex-direction: row;\n' },
    column:    { css:'  flex-direction: column;\n' },
    center:    { css:'  justify-content: center;\n  align-items: center;\n' },
    wrap:      { css:'  flex-wrap: wrap;\n' },
    rounded:   { css:'  border-radius: 999px;\n' },
    pointer:   { css:'  cursor: pointer;\n' },
    bold:      { css:'  font-weight: bold;\n' },
    italic:    { css:'  font-style: italic;\n' },
    block:     { css:'  display: block;\n' },
    inline:    { css:'  display: inline;\n' },
    relative:  { css:'  position: relative;\n' },
    absolute:  { css:'  position: absolute;\n' },
    fixed:     { css:'  position: fixed;\n' },
    sticky:    { css:'  position: sticky;\n' },
    none:      { css:'  display: none;\n' },
    hidden:    { css:'  display: none;\n' },
    nowrap:    { css:'  white-space: nowrap;\n' },
    uppercase: { css:'  text-transform: uppercase;\n' },
    ellipsis:  { css:'  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n' },
    scroll:    { css:'  overflow: auto;\n' },
    grid:      { css:'  display: grid;\n' },
    glass:     { css:'  background: rgba(255,255,255,0.05);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  border: 1px solid rgba(255,255,255,0.08);\n' },
    glow:      { css:'  filter: drop-shadow(0 0 8px currentColor);\n' },
  }

  if (shorthands[key]) return { css: shorthands[key].css, extra:'' }
  if (value === true)  return { css:'', extra:'' }

  var prop = THREAD_ALIASES[key] || key

  // shadow preset
  if ((key === 'shadow' || prop === 'box-shadow') && THREAD_PRESETS.shadow[value]) {
    return { css: '  box-shadow: ' + THREAD_PRESETS.shadow[value] + ';\n', extra:'' }
  }

  // transition preset
  if (key === 'transition' && THREAD_PRESETS.transition[value]) {
    return { css: '  transition: ' + THREAD_PRESETS.transition[value] + ';\n', extra:'' }
  }

  // gradient preset
  if (key === 'gradient' && THREAD_PRESETS.gradient[value]) {
    // gradient text technique
    var gradVal = THREAD_PRESETS.gradient[value]
    return {
      css: '  background: ' + gradVal + ';\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n',
      extra:''
    }
  }

  // animation shorthand:  animate: name duration easing
  if (key === 'animate') {
    return { css: '  animation: ' + value + ';\n', extra:'' }
  }

  // border shorthand: border: 2 solid #333 → border: 2px solid #333
  if ((key === 'border' || prop === 'border') && !/px|em|rem|%/.test(value.split(' ')[0])) {
    var parts = value.split(/\s+/)
    if (parts.length >= 2 && !isNaN(parts[0])) parts[0] = parts[0] + 'px'
    value = parts.join(' ')
    return { css: '  border: ' + value + ';\n', extra:'' }
  }

  // clamp() support
  if (value && value.toString().startsWith('clamp(')) {
    // Replace bare numbers inside clamp with px
    value = value.replace(/clamp\((\S+),\s*(\S+),\s*(\S+)\)/, function(_, a, b, c) {
      if (!isNaN(a)) a = a + 'px'
      if (!isNaN(c)) c = c + 'px'
      return 'clamp(' + a + ', ' + b + ', ' + c + ')'
    })
  }

  // Numeric px
  if (THREAD_NUMERIC.includes(prop) && value !== undefined) {
    value = String(value).split(/\s+/).map(function(v) {
      return (!isNaN(v) && v !== '') ? v + 'px' : v
    }).join(' ')
  }

  return { css: '  ' + prop + ': ' + value + ';\n', extra:'' }
}

// ══════════════════════════════════════════════════════════════════════
//   WEAVE JS COMPILER v2
// ══════════════════════════════════════════════════════════════════════

function compileWeaveBlock(source) {
  var lines   = source.split('\n')
  var out     = []
  var inAsync = false

  for (var i = 0; i < lines.length; i++) {
    out.push(compileWeaveLine(lines[i]))
  }

  // Wrap the whole script in an auto-async IIFE for await support
  var compiled = out.join('\n')
  return compiled
}

function compileWeaveLine(line) {
  var t = line.trim()
  if (t === '' || t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) return line

  // task name(args) { → async function name(args) {
  if (/^task\s+\w+\s*=\s*/.test(t)) return line.replace(/\btask\b/, 'const')
  if (/^task\s+\w+\s*\(/.test(t)) return line.replace(/\btask\b/, 'async function')

  // say(...) → console.log(...)
  if (/\bsay\s*\(/.test(t)) return line.replace(/\bsay\s*\(/g, 'console.log(')

  // show(sel) → document.querySelector(sel).style.display = ''
  var showM = t.match(/^show\s*\(\s*["'](.+?)['"]\s*\)$/)
  if (showM) { var ind = line.match(/^(\s*)/)[1]; return ind + 'document.querySelector("' + showM[1] + '").style.display = ""' }

  // hide(sel) → ...style.display = 'none'
  var hideM = t.match(/^hide\s*\(\s*["'](.+?)['"]\s*\)$/)
  if (hideM) { var ind = line.match(/^(\s*)/)[1]; return ind + 'document.querySelector("' + hideM[1] + '").style.display = "none"' }

  // toggle(sel)
  var togM = t.match(/^toggle\s*\(\s*["'](.+?)['"]\s*\)$/)
  if (togM) { var ind = line.match(/^(\s*)/)[1]; return ind + '(function(){ var _e = document.querySelector("' + togM[1] + '"); _e.style.display = _e.style.display === "none" ? "" : "none"; })()' }

  // addClass(sel, cls)
  var addCM = t.match(/^addClass\s*\(\s*["'](.+?)['"]\s*,\s*["'](.+?)['"]\s*\)$/)
  if (addCM) { var ind = line.match(/^(\s*)/)[1]; return ind + 'document.querySelector("' + addCM[1] + '").classList.add("' + addCM[2] + '")' }

  // removeClass(sel, cls)
  var remCM = t.match(/^removeClass\s*\(\s*["'](.+?)['"]\s*,\s*["'](.+?)['"]\s*\)$/)
  if (remCM) { var ind = line.match(/^(\s*)/)[1]; return ind + 'document.querySelector("' + remCM[1] + '").classList.remove("' + remCM[2] + '")' }

  // toggleClass(sel, cls)
  var togCM = t.match(/^toggleClass\s*\(\s*["'](.+?)['"]\s*,\s*["'](.+?)['"]\s*\)$/)
  if (togCM) { var ind = line.match(/^(\s*)/)[1]; return ind + 'document.querySelector("' + togCM[1] + '").classList.toggle("' + togCM[2] + '")' }

  // attr(sel, name, val)  — set
  var setAtM = t.match(/^attr\s*\(\s*["'](.+?)['"]\s*,\s*["'](.+?)['"]\s*,\s*(.+?)\s*\)$/)
  if (setAtM) { var ind = line.match(/^(\s*)/)[1]; return ind + 'document.querySelector("' + setAtM[1] + '").setAttribute("' + setAtM[2] + '", ' + setAtM[3] + ')' }

  // getAttr(sel, name)
  var getAtM = t.match(/^getAttr\s*\(\s*["'](.+?)['"]\s*,\s*["'](.+?)['"]\s*\)/)
  if (getAtM) return line.replace(/getAttr\s*\(\s*["'](.+?)['"]\s*,\s*["'](.+?)['"]\s*\)/, 'document.querySelector("$1").getAttribute("$2")')

  // html(sel, markup) → innerHTML
  var htmlM = t.match(/^html\s*\(\s*["'](.+?)['"]\s*,/)
  if (htmlM) { var ind = line.match(/^(\s*)/)[1]; return line.replace(/\bhtml\s*\(\s*["'](.+?)['"]\s*,\s*/, 'document.querySelector("$1").innerHTML = ') }

  // style(sel, prop, val) → inline style
  var styleM = t.match(/^style\s*\(\s*["'](.+?)['"]\s*,\s*["'](.+?)['"]\s*,\s*(.+?)\s*\)$/)
  if (styleM) { var ind = line.match(/^(\s*)/)[1]; return ind + 'document.querySelector("' + styleM[1] + '").style["' + styleM[2] + '"] = ' + styleM[3] }

  // query(sel) → document.querySelector(sel)
  if (/\bquery\s*\(/.test(t) && !/queryAll/.test(t)) {
    return line.replace(/\bquery\s*\(/g, 'document.querySelector(')
  }

  // queryAll(sel) → [...document.querySelectorAll(sel)]
  if (/\bqueryAll\s*\(/.test(t)) {
    return line.replace(/\bqueryAll\s*\(/g, '[...document.querySelectorAll(')
               .replace(/\)\s*$/, '))')  // close the spread
  }

  // emit(element, event, detail)  — CustomEvent
  var emitM = t.match(/^emit\s*\(/)
  if (emitM) {
    return line.replace(/\bemit\s*\(\s*([^,]+)\s*,\s*["'](.+?)['"]\s*,\s*(\{[\s\S]*?\})\s*\)/, function(m, el, ev, detail) {
      return el.trim() + '.dispatchEvent(new CustomEvent("' + ev + '", { detail: ' + detail + ', bubbles: true }))'
    }).replace(/\bemit\s*\(\s*([^,]+)\s*,\s*["'](.+?)['"]\s*\)/, function(m, el, ev) {
      return el.trim() + '.dispatchEvent(new CustomEvent("' + ev + '", { bubbles: true }))'
    })
  }

  // store("key", val) → localStorage.setItem
  var storeM = t.match(/^store\s*\(\s*["'](.+?)['"]\s*,\s*(.+?)\s*\)$/)
  if (storeM) { var ind = line.match(/^(\s*)/)[1]; return ind + 'localStorage.setItem("' + storeM[1] + '", ' + storeM[2] + ')' }

  // get("key") — localStorage only when in a non-fetch context
  // We'll disambiguate: get("key") with no protocol = localStorage, get("http...") = fetch
  var getLocalM = t.match(/\bget\s*\(\s*["'](?!https?:\/\/)([^"']+)['"]\s*\)/)
  if (getLocalM && !t.match(/\bget\s*\(\s*["']https?:\/\//)) {
    return line.replace(/\bget\s*\(\s*["']([^"']+)['"]\s*\)/g, 'localStorage.getItem("$1")')
  }

  // get("url") → await fetch JSON GET
  if (/\bget\s*\(\s*["']https?:\/\//.test(t)) {
    return line.replace(/\bget\s*\(\s*["'](.+?)['"]\s*\)/g, "await fetch('$1').then(function(r){ return r.json() })")
  }

  // post("url", body) → await fetch JSON POST
  if (/\bpost\s*\(\s*["']/.test(t)) {
    return line.replace(/\bpost\s*\(\s*["'](.+?)['"]\s*,\s*(.+?)\s*\)$/,
      "await fetch('$1', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify($2) }).then(function(r){ return r.json() })")
  }

  // wait(ms) → await new Promise(r => setTimeout(r, ms))
  if (/\bwait\s*\(/.test(t)) {
    return line.replace(/\bwait\s*\((.+?)\)/g, 'await new Promise(function(r){ setTimeout(r, $1) })')
  }

  // repeat(n, fn) → for loop helper
  var repeatM = t.match(/^repeat\s*\(\s*(\d+)\s*,/)
  if (repeatM) {
    return line.replace(/\brepeat\s*\(\s*(\d+)\s*,\s*(.+?)\s*\)$/, function(m, n, fn) {
      return 'for (var _ri = 0; _ri < ' + n + '; _ri++) { (' + fn + ')(_ri) }'
    })
  }

  // tween(el, { props }, ms) → Object.assign(el.style, props) with transition
  var tweenM = t.match(/^tween\s*\(/)
  if (tweenM) {
    return line.replace(/\btween\s*\(\s*([^,]+)\s*,\s*(\{[^}]+\})\s*,\s*(\d+)\s*\)/, function(m, el, props, ms) {
      return '(function(){ var _el = ' + el.trim() + '; _el.style.transition = "all ' + ms + 'ms ease"; Object.assign(_el.style, ' + props + ') })()'
    })
  }

  // route("path", fn) — hash router
  var routeM = t.match(/^route\s*\(\s*["'](.+?)['"]\s*,/)
  if (routeM) {
    return line.replace(/\broute\s*\(\s*["'](.+?)['"]\s*,\s*(.+?)\s*\)/, function(m, path, fn) {
      return 'window.addEventListener("hashchange", function(){ if (location.hash === "#' + path + '") (' + fn + ')() })'
    })
  }

  // put(value, "#sel")
  var putM = t.match(/^put\s*\(\s*(.+?)\s*,\s*["'](.+?)['"]\s*\)$/)
  if (putM) { var ind = line.match(/^(\s*)/)[1]; return ind + 'document.querySelector("' + putM[2] + '").textContent = ' + putM[1] }

  // on("sel", "event", fn)
  var onM = t.match(/^on\s*\(\s*["'](.+?)['"]\s*,\s*["'](.+?)['"]\s*,\s*([\s\S]+?)\s*\)$/)
  if (onM) { var ind = line.match(/^(\s*)/)[1]; return ind + 'document.querySelector("' + onM[1] + '").addEventListener("' + onM[2] + '", ' + onM[3] + ')' }

  // load("url") → await fetch JSON
  if (/\bload\s*\(\s*["']/.test(t)) {
    return line.replace(/\bload\s*\(\s*["'](.+?)['"]\s*\)/g, "await fetch('$1').then(function(r){ return r.json() })")
  }

  // ping("url")
  if (/\bping\s*\(\s*["']/.test(t)) {
    return line.replace(/\bping\s*\(\s*["'](.+?)['"]\s*\)/g, "await fetch('$1', { method: 'HEAD' }).then(function(r){ return r.ok }).catch(function(){ return false })")
  }

  return line
}

// ── Page builders ──────────────────────────────────────────────────────

var RUNTIME_JS = `
// Weave v2 runtime helpers
function __qs(s){ return typeof s === 'string' ? document.querySelector(s) : s }
function __qsa(s){ return [...document.querySelectorAll(s)] }
`

function buildFullPage(title, bodyHTML, css, js) {
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
    '  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">\n' +
    '  <title>' + esc(title) + '</title>\n' +
    '  <style>\n* { box-sizing: border-box; margin: 0; padding: 0; }\n' + css + '\n  </style>\n' +
    '</head>\n<body>\n  ' + bodyHTML + '\n' +
    '  <script>\n' + RUNTIME_JS + '\n;(async function(){\n' + js + '\n})();\n  <\/script>\n' +
    '</body>\n</html>'
}

function buildJSOnlyPage(js) {
  return '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Weave Output</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">' +
    '<style>body{background:#080810;color:#6ee7b7;font-family:"JetBrains Mono",monospace;padding:24px;font-size:13px;line-height:1.7;}' +
    '#output{white-space:pre-wrap;}' +
    '.err{color:#f87171;}</style>' +
    '</head>\n<body>\n<pre id="output"></pre>\n<script>\n' +
    RUNTIME_JS + '\n' +
    ';(async function(){\n' +
    '  var _log = console.log.bind(console);\n' +
    '  var out = document.getElementById("output");\n' +
    '  console.log = function() { var msg = Array.from(arguments).map(function(a){ return typeof a === "object" ? JSON.stringify(a,null,2) : String(a) }).join(" "); out.textContent += msg + "\\n"; _log.apply(console, arguments); };\n' +
    '  try {\n' +
    js + '\n' +
    '  } catch(e) { out.innerHTML += \'<span class="err">Error: \' + e.message + \'</span>\\n\' }\n' +
    '})();\n<\/script>\n</body>\n</html>'
}

function buildThreadPreviewPage(css) {
  return '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Thread Preview</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap" rel="stylesheet">' +
    '<style>* { box-sizing: border-box; margin: 0; padding: 0; }\n' + css + '</style>' +
    '</head>\n<body>\n' +
    '  <div class="demo-grid">' +
    '    <div class="card"><div class="card-title">Card One</div><div class="card-body">Thread preview — add chicken-nuget for real elements.</div></div>' +
    '    <div class="card glass-card"><div class="card-title">Glass Card</div><div class="card-body">Frosted glass effect via Thread shorthand.</div></div>' +
    '  </div>' +
    '  <h1 style="margin:40px auto;text-align:center">Thread v2 Preview</h1>' +
    '  <p class="shimmer-text" style="text-align:center;margin:0 auto 40px">Gradient · Animation · Variables</p>' +
    '  <div style="text-align:center;margin-bottom:40px"><span class="float-badge">Floating Badge</span></div>' +
    '  <div style="text-align:center"><button>Styled Button</button></div>' +
    '</body>\n</html>'
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

// ── COMPILE + PREVIEW ─────────────────────────────────────────────────

function compileAndPreview() {
  if (!editor) return
  var source = editor.getValue()
  setStatus('loading', 'Compiling…')
  compileErrors = []

  try {
    var compiled = compileWeave(source)
    lastCompiledHTML = compiled
    document.getElementById('preview').srcdoc = compiled
    document.getElementById('outputView').textContent = compiled
    clearErrorMarkers()
    setStatus('ok', 'Compiled  ✓')
  } catch (err) {
    setStatus('error', 'Error: ' + err.message)
    console.error('Compile error:', err)
  }
}

function clearErrorMarkers() {
  if (editor) decorations = editor.deltaDecorations(decorations, [])
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

// ── TOOLBAR ───────────────────────────────────────────────────────────

document.getElementById('compileBtn').addEventListener('click', compileAndPreview)
document.getElementById('runBtn').addEventListener('click', compileAndPreview)
document.getElementById('refreshBtn').addEventListener('click', compileAndPreview)

document.getElementById('downloadBtn').addEventListener('click', function () {
  var source = editor ? editor.getValue() : ''
  var blob = new Blob([source], { type: 'text/plain' })
  var a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = activeFile
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

// ── FILE TREE ─────────────────────────────────────────────────────────

document.querySelectorAll('.tree-file').forEach(function (item) {
  item.addEventListener('click', function () {
    document.querySelectorAll('.tree-file').forEach(function(f){ f.classList.remove('active') })
    item.classList.add('active')

    var key  = item.dataset.example
    var name = item.querySelector('span:last-child').textContent
    activeFile = name
    document.getElementById('currentFile').textContent      = name
    document.getElementById('editorTabLabel').textContent   = name
    document.getElementById('editorBreadcrumb').textContent = name

    // Save current before switching
    if (editor) VFS[activeFile] = editor.getValue()

    var content = VFS[name] || (key && EXAMPLES[key]) || ''
    if (content && editor) {
      editor.setValue(content)
      compileAndPreview()
    }
  })
})

document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); compileAndPreview() }
})

// ══════════════════════════════════════════════════════════════════════
//   AI PANEL — v2 (Multi-turn, full spec)
// ══════════════════════════════════════════════════════════════════════

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
    var textBefore = content.replace(/```[\w]*\n[\s\S]*?```/g, '').trim()
    if (textBefore) {
      var p = document.createElement('p')
      p.style.marginBottom = '8px'
      p.innerHTML = textBefore.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                               .replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br>')
      bubble.appendChild(p)
    }
    bubble.appendChild(pre)
    bubble.appendChild(btn)
  } else {
    bubble.innerHTML = content
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/`([^`]+)`/g,'<code>$1</code>')
      .replace(/\n/g,'<br>')
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

// Full v2 system prompt for AI
function buildSystemPrompt() {
  return `You are an expert weave.web v2 developer. weave.web is a unified language system where .web files combine three sublanguages.

══ WEAVE.WEB LANGUAGE SYSTEM ══

Each .web file starts with @import declarations:
  @import HTML body    → chicken-nuget HTML block
  @import Thread style → Thread CSS block
  @import JS ff        → Weave JS block

━━ CHICKEN-NUGET (HTML) ━━

page Name {
    // Elements: tag [#id] [.class1.class2] ["text"] [attrs]
    h1 #title .hero "Welcome"
    p  "Some text"
    button #btn .primary "Click me"
    input  #email "Enter email"
    img    src="url" alt="desc"
    a "Link" href="url"
    hr  br  // void elements

    // NESTED blocks with { }
    div #app .container {
        section .hero {
            h1 "Title"
            p  "Body"
        }
        ul {
            li "Item 1"
            li "Item 2"
        }
    }

    // Components
    component Card {
        div .card { slot "content" }
    }
}

━━ THREAD (CSS) ━━

style {
    --primary: #6ee7b7          // CSS variables → :root {}
    
    selector {
        // ALIASES
        bg: #color              // background
        text: #color            // color
        pad: 20 40              // padding (auto-px on numbers)
        radius: 12              // border-radius
        size: 18                // font-size
        weight: 700             // font-weight
        w: 100%  h: 200         // width / height
        gap: 16  align: center  // gap / text-align
        z: 100   opacity: 0.8   // z-index / opacity
        border: 2 solid #333    // border (auto-px on width)
        animate: name 0.5s ease // animation
        gradient: neon          // gradient text (sunset|ocean|forest|neon|dusk)
        shadow: soft            // box-shadow preset
        transition: smooth      // transition preset

        // SHORTHANDS (no value needed)
        flex  row  column  center  wrap  grid
        rounded  pointer  bold  italic  uppercase
        sticky  hidden  glass  glow  ellipsis  scroll
        relative  absolute  fixed

        // PRESETS
        shadow: soft|hard|glow|lifted|card|none
        transition: fast|smooth|slow|bounce
        gradient: sunset|ocean|forest|neon|dusk

        // NESTED selectors
        .child { text: red }
        &:hover { transform: translateY(-4px) }  // & = parent ref
        &:active { opacity: 0.8 }

        // clamp() for fluid type
        size: clamp(16, 2vw, 24)
    }

    // @media queries
    @media (max-width: 768px) {
        body { pad: 20 }
    }

    // @keyframes
    @keyframes fade {
        from { opacity: 0  transform: translateY(20px) }
        to   { opacity: 1  transform: translateY(0) }
    }
}

━━ WEAVE (JS) ━━

script {
    // DOM
    put(value, "#sel")                    // textContent setter
    html("#sel", \`markup\`)               // innerHTML setter
    show("#sel")  hide("#sel")  toggle("#sel")
    addClass("#sel", "cls")   removeClass(…)  toggleClass(…)
    attr("#sel", "name", value)   getAttr("#sel", "name")
    style("#sel", "prop", value)  // inline CSS
    query("#sel")                          // querySelector
    queryAll("#sel")                       // [...querySelectorAll]
    emit(element, "event", { detail })     // CustomEvent

    // Events
    on("#sel", "event", handler)           // addEventListener
    on("#btn", "click", () => { ... })

    // Async / network
    let data = await get("https://api.example.com/data")   // JSON GET
    let res  = await post("https://api.example.com", { key: val }) // JSON POST
    await wait(500)                        // sleep ms
    await load("url")                      // fetch JSON
    await ping("url")                      // fetch HEAD → bool

    // Storage
    store("key", value)                    // localStorage.setItem
    get("key")                             // localStorage.getItem (non-URL)

    // Helpers
    say(value)                             // console.log
    repeat(5, (i) => { ... })             // loop
    tween(element, { transform: "..." }, 200)  // CSS transition
    route("/path", fn)                     // hash router

    // task = async function
    task fetchData() {
        let d = await get("https://api.example.com")
        put(d.name, "#output")
    }

    // Arrow task
    task greet = (name) => "Hello " + name

    // Template literals, destructuring, spread, classes all work
    let { x, y } = point
    let items = [...arr1, ...arr2]
}

══ RULES ══
1. Always wrap script content in script { ... }
2. Always wrap style content in style { ... }
3. Always wrap HTML in page Name { ... }
4. Nesting in HTML uses { } blocks
5. Thread nested rules use { } blocks
6. CSS vars declared at top of style block as --name: value
7. & refers to parent selector in Thread nesting
8. task functions are automatically async — use await freely
9. get() with a URL is fetch, get() with a plain string is localStorage
10. Generate complete, runnable .web files — always include all three @import lines when using all three languages

══ DESIGN GUIDANCE ══
Always create beautiful, modern UIs. Use:
- Dark backgrounds (#080810 bg, #0f0f1e surface)
- Accent colors: --primary: #6ee7b7  --accent: #818cf8
- Syne font for display, JetBrains Mono for code
- glass shorthand for frosted glass effects
- shadow: glow for neon effects
- gradient: neon for text gradients
- Smooth transitions and hover animations
- clamp() for responsive type scales
- CSS custom properties (variables) for consistency`
}

async function sendAIMessage() {
  var prompt = aiPrompt.value.trim()
  if (!prompt) return

  appendMessage('user', prompt)
  aiPrompt.value  = ''
  aiSend.disabled = true

  // Build messages array for multi-turn
  var messages = []

  // Add history (last 8 exchanges = 16 messages)
  var historySlice = aiHistory.slice(-16)
  for (var i = 0; i < historySlice.length; i++) {
    messages.push(historySlice[i])
  }

  // Build current message
  var fullPrompt = prompt
  if (sendCtx.checked && editor) {
    var code = editor.getValue()
    fullPrompt = 'Current editor code:\n```\n' + code + '\n```\n\nUser request: ' + prompt +
      '\n\nIf generating code, wrap it in a single ```weave code block.'
  } else {
    fullPrompt = prompt + '\n\nIf generating code, wrap it in a single ```weave code block.'
  }

  messages.push({ role: 'user', content: fullPrompt })

  var thinking = appendThinking()

  try {
    var resp = await fetch(AI_ENDPOINT, {
      method: 'POST',
      mode:   'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: buildSystemPrompt() + '\n\n---\n\n' + messages.map(function(m) {
          return (m.role === 'user' ? 'User: ' : 'Assistant: ') + m.content
        }).join('\n\n')
      })
    })
    var raw = await resp.text()
    var data = {}
    try { data = JSON.parse(raw) } catch(e) { throw new Error(raw) }
    if (!resp.ok) throw new Error(data.error || 'HTTP ' + resp.status)

    var result = data.result || data.content || ''
    if (!result) throw new Error('AI returned no result.')

    thinking.remove()

    // Save to history
    aiHistory.push({ role: 'user', content: fullPrompt })
    aiHistory.push({ role: 'assistant', content: result })
    if (aiHistory.length > 20) aiHistory = aiHistory.slice(-20)

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
