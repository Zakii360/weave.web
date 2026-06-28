## READ THIS
Yes, as many will point out, this IS vibe coded with Sonnet 4.6 LLM. I've completely developed the original weave system myself but with exams and working on 360, AI becomes useful to handle the tasks that are not as important to me but still fun and cool to work on.

# Weave.web

A browser-based compiler combining Weave and Chicken-Nuget.

## Features

- .web files
- HTML output
- JS output
- Hybrid mode
- Monaco editor
## Now with Beta Thread integration | CSS

--

 # V2:

 # weave.web v2 — Overhauled

> One `.web` file. Three languages. No limits.

## What's in the overhaul

### 🧱 chicken-nuget (HTML) — massively expanded

| Before | After |
|--------|-------|
| Flat inline elements only | **Fully nested `{ }` blocks** |
| `h1 "text"` | `div #app .container { section .hero { h1 "title" } }` |
| No components | `component Card { div .card { slot "content" } }` |
| No attributes | `button #btn data-index=0 "Click"` |
| No classes | `div .card.hero.active "text"` |
| No img/hr/br | `img src="url" alt="desc"` · `hr` · `br` |
| No lists | `ul { li "Item 1"  li "Item 2" }` |
| No forms | `form #login { input #email "Email"  button "Submit" }` |

### 🎨 Thread (CSS) — supercharged

| Added | Syntax |
|-------|--------|
| CSS variables | `--primary: #6ee7b7` → auto-injected into `:root {}` |
| `&` parent ref | `&:hover { }` `&:active { }` `&::before { }` |
| @keyframes | `@keyframes fade { from { opacity: 0 } to { opacity: 1 } }` |
| @media queries | `@media (max-width: 768px) { body { pad: 20 } }` |
| New presets | `shadow: glow\|lifted\|card` · `transition: bounce` · `gradient: neon\|sunset\|ocean` |
| New shorthands | `glass` (frosted glass) · `glow` (text glow) · `sticky` · `grid` · `hidden` · `ellipsis` |
| Fluid type | `size: clamp(16, 2vw, 24)` |
| animate alias | `animate: fadeIn 0.5s ease` → `animation: fadeIn 0.5s ease` |
| Auto-px border | `border: 2 solid #333` → `border: 2px solid #333` |

**New presets reference:**
```
shadow:     soft | hard | glow | lifted | card | none
transition: fast | smooth | slow | bounce
gradient:   sunset | ocean | forest | neon | dusk
glass       → frosted glass (backdrop-filter + rgba bg)
glow        → filter: drop-shadow glow
```

### ⚡ Weave (JS) — full DOM + async runtime

| Added | Description |
|-------|-------------|
| `show/hide/toggle("#sel")` | display shortcuts |
| `addClass/removeClass/toggleClass("#sel", "cls")` | classList wrappers |
| `attr("#sel", "name", val)` / `getAttr(…)` | setAttribute / getAttribute |
| `html("#sel", markup)` | innerHTML setter |
| `style("#sel", "prop", val)` | inline style setter |
| `query("#sel")` | querySelector |
| `queryAll("#sel")` | [...querySelectorAll] |
| `emit(el, "event", { detail })` | CustomEvent dispatch |
| `await get("https://…")` | JSON fetch GET |
| `await post("https://…", body)` | JSON fetch POST |
| `await wait(500)` | Promise sleep (ms) |
| `store("key", val)` / `get("key")` | localStorage wrappers |
| `repeat(n, fn)` | loop helper |
| `tween(el, { props }, ms)` | CSS transition trigger |
| `route("/path", fn)` | hash-based router |
| `task` auto-async | all `task` functions are `async function` |
| Template literals | `` `Hello ${name}` `` pass-through |
| Arrow tasks | `task greet = (name) => "Hello " + name` |
| Full JS pass-through | classes, destructuring, spread, try/catch |

### 🤖 AI Chatbot — v2

- Full v2 language spec injected as system prompt
- **Multi-turn memory** — last 8 exchanges remembered
- **Ctrl+K** → inline AI prompt in editor
- 6 new prompt chips for common use cases
- **Export HTML** button added to toolbar
- Edge function now supports **Anthropic Claude** (primary) with Groq as fallback

## File structure

```
weave-overhaul/
├── index.html              ← IDE shell (Monaco editor, panels, AI sidebar)
├── app.js                  ← Full compiler + editor logic
├── style.css               ← IDE chrome styles
└── SUPABASE_EDGE_FUNCTION.ts  ← Deploy to Supabase (supports Claude + Groq)
```


## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Compile & preview |
| `Ctrl+S` | Save & compile |
| `Ctrl+K` | Open AI with selection |
| `Ctrl+Space` | Trigger autocomplete |

## The Weave family

| Language | Role | Maps to |
|----------|------|---------|
| **chicken-nuget** | Structure | HTML |
| **Thread** | Style | CSS |
| **Weave** | Logic | JavaScript |
| **weave.web** | Container | `.web` files holding all three |
