# Workout Log

A small offline-first PWA for logging home-gym workouts. No account, no
server — everything is saved to `localStorage` on your phone.

Built around this equipment: a bench, 5kg/10kg straight bars, a 5kg preacher
curl bar, 160kg of plates, dumbbells (1/3/5/10/15/20kg), a cage pulley
station (high + low pulley), a landmine attachment, a plywood box, and a
step.

## Using it

- **Today** — pick a routine (or a blank/custom workout) and log sets as you go.
  Each exercise shows your numbers from last time so you can aim to beat them.
- **History** — every finished workout, expandable per exercise.
- **Routines** — edit your default workouts: reorder exercises, change target
  sets/reps, add or remove exercises.
- **Exercises** — the exercise library; add your own or edit the defaults.
- **Settings** — install to your home screen, export/import a JSON backup,
  or wipe all data.

## Deploying to GitHub Pages

Push to `main` and the included GitHub Actions workflow
(`.github/workflows/deploy.yml`) publishes the site automatically. In the
repo settings, under **Pages**, set the source to **GitHub Actions** (only
needed once).

## Local development

No build step — just serve the folder statically, e.g.:

```
python3 -m http.server 8080
```

then open `http://localhost:8080`.
