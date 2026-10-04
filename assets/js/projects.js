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
  }
];
