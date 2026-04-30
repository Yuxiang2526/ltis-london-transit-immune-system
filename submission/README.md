# Submission folder

## How to convert `Group17_Project_Info.md` to PDF / DOCX

The marking rubric requires a PDF or Word document. This folder ships the
content as Markdown (the source of truth); convert it before submission.

### Option A — Microsoft Word (no extra tools)

1. Open `Group17_Project_Info.md` in **Word** (drag-and-drop into Word, or
   File → Open and pick "All files").
2. Word will render the Markdown headings / tables.
3. **File → Save As → PDF** (or `.docx`) and save next to this file as
   `Group 17 Project Info.pdf` (and/or `.docx`).

### Option B — Pandoc (if installed)

```bash
cd submission
pandoc Group17_Project_Info.md -o "Group 17 Project Info.docx"
pandoc Group17_Project_Info.md -o "Group 17 Project Info.pdf" --pdf-engine=xelatex
```

### Option C — VS Code "Markdown PDF" extension

Open the `.md` file in VS Code, install **Markdown PDF** extension, then
right-click in the editor → "Markdown PDF: Export (pdf)".

---

## What goes in the final submission ZIP

```
group17_submission.zip
├── Group 17 Project Info.pdf        (or .docx — required)
├── README.md                         (top-level project README)
├── docs/                             (methodology summary + ADRs)
├── data/DATA_SOURCES.md
├── CITATION.cff
├── LICENSE
├── web/                              (frontend source — DO NOT include node_modules/)
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── analysis/                         (Python aggregation scripts)
```

The data-calculation pipeline lives in a companion repo
(<https://github.com/Taoo2025/CASA0029/tree/main/data_calculating>) and is
referenced from the Project Info doc; it does not need to be re-zipped here.

To produce a clean zip from the project root:

```bash
# from repo root
git archive --format zip -o submission/group17_submission.zip HEAD
# then add the converted PDF/DOCX manually since it's not in git
```

`git archive` automatically excludes `node_modules/`, build artefacts and
anything ignored by `.gitignore`.
