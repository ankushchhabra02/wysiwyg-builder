## WYSIWYG Web Page Builder

A simple drag-and-drop web page builder inspired by WordPress/Wix. Built with Next.js, React DnD, React RND, Tailwind CSS, and optional React Quill for rich text.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Features (assignment coverage)

- Canvas + sidebar toolbox (Text, Image, Button, Card, Video)
- Drag to place, resize items; snap-to-grid; delete item
- Edit text directly; rich text toolbar (bold/italic/underline, size, color, align)
- Image upload or paste URL; button label/link/variant
- Canvas background color picker
- Design/Preview toggle
- Dark mode toggle (persists) with html.dark and Tailwind dark variants
- Export JSON and static HTML

## Notes

- If dark mode doesn’t flip immediately, refresh once. The app sets the html.dark class and CSS variables for background/foreground.
- Video URLs (YouTube/Vimeo) are normalized to embed links.

## Deploy

Any static/Node host (Vercel, Netlify). For Vercel:

```bash
npm run build
npm start
```
