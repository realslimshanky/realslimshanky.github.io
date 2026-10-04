# realslimshanky.github.io

Personal portfolio for Shashank Kumar, served at [shanky.dev](https://shanky.dev).

Plain HTML/CSS/JS with no build step. GitHub Pages serves it as-is.

- **Hero:** Three.js shader drawing a live topographic map that bends toward the cursor (`assets/js/hero.js`)
- **Motion:** GSAP + ScrollTrigger + SplitText, loaded from a CDN (`assets/js/main.js`)
- **Styles:** `assets/css/style.css`, with dark and light themes driven by CSS custom properties

## Adding a hobby project

Open `assets/js/projects.js` and add an object to the top of the `WORKBENCH` array:

```js
{
  title: "My thing",
  year: "2026",
  status: "tinkering",          // "shipped" | "tinkering" | "idea"
  emoji: "🛠️",
  blurb: "One or two sentences about it.",
  tags: ["Python"],
  links: [{ label: "Repo", href: "https://github.com/realslimshanky/my-thing" }]
}
```

Cards are numbered automatically, and the filter tabs show a status only once a project uses it.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```
