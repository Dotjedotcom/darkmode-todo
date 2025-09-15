# Darkmode Todo (React + Vite + Tailwind)

A small dark-mode Todo app with IndexedDB → localStorage → memory fallback, inline editing,
and share (Web Share API → Clipboard). Completed items are shown disabled and sorted to the bottom.

## Quickstart

```bash
npm i
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Build & Preview

```bash
npm run build
npm run preview
```

## Git: create repo & push

```bash
git init
git add .
git commit -m "Initial commit: Darkmode Todo"
# Create an empty repo at GitHub (no README/license), then:
git branch -M main
git remote add origin git@github.com:<YOUR_USERNAME>/darkmode-todo.git
git push -u origin main
```

## Notes

- If your browser blocks IndexedDB or Clipboard in a sandbox, the app will gracefully fall back
  and keep running. Use a normal browser tab for full functionality.
- Tailwind is included for styling; feel free to replace with your own CSS if you prefer.
