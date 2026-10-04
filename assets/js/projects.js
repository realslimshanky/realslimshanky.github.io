/* ==========================================================================
   The Workbench — hobby projects, experiments and half-built ideas.

   To add a project, copy one of the objects below and edit it. Newest first.
   Fields:
     title    (required)  Project name.
     year     (required)  e.g. "2026".
     status   (required)  "shipped" | "tinkering" | "idea"
     blurb    (required)  One or two sentences.
     emoji    (optional)  A single glyph shown on the card.
     tags     (optional)  ["Python", "FastAPI"]
     links    (optional)  [{ label: "Repo", href: "https://..." }]
   ========================================================================== */

window.WORKBENCH = [
  {
    title: "Pricy",
    year: "2026",
    status: "shipped",
    emoji: "🏷️",
    blurb: "ML Zoomcamp capstone: a price-prediction model served as a live API.",
    tags: ["Python", "ML", "API"],
    links: [
      { label: "Live API", href: "https://pricy-production.up.railway.app/docs" },
      { label: "Repo", href: "https://github.com/realslimshanky/Pricy" }
    ]
  },
  {
    title: "Hearty",
    year: "2025",
    status: "shipped",
    emoji: "🫀",
    blurb: "ML Zoomcamp midterm project, from notebook exploration to a trained model.",
    tags: ["Python", "Jupyter", "ML"],
    links: [{ label: "Repo", href: "https://github.com/realslimshanky/Hearty" }]
  },
  {
    title: "Simple Telegram Chatbot",
    year: "2021",
    status: "shipped",
    emoji: "💬",
    blurb: "A minimal starter for getting a Telegram chatbot running quickly.",
    tags: ["Python", "Telegram"],
    links: [{ label: "Repo", href: "https://github.com/realslimshanky/simple-telegram-chatbot" }]
  },
  {
    title: "Termux Python",
    year: "2017",
    status: "shipped",
    emoji: "📱",
    blurb: "Python experiments running on Android, straight from Termux.",
    tags: ["Python", "Android"],
    links: [{ label: "Repo", href: "https://github.com/realslimshanky/termuxpython" }]
  },
  {
    title: "open2017",
    year: "2016",
    status: "shipped",
    emoji: "🎆",
    blurb: "A landing page for a New Year's Eve 2017 live stream.",
    tags: ["Web"],
    links: [{ label: "Repo", href: "https://github.com/realslimshanky/open2017" }]
  }
];
