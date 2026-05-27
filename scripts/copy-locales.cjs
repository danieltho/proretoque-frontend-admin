// Post-build step: copy source locale files into the production output so the
// i18next HTTP backend can fetch them at /locales/{lang}/translation.json.
// Mirrors the dev-time localesWatcherPlugin in vite.config.ts.
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs')
const path = require('path')

const LANGS = ['es', 'en', 'it', 'fr', 'pt', 'tr']
const root = path.resolve(__dirname, '..')

let copied = 0
for (const lang of LANGS) {
  const src = path.join(root, 'locales', `${lang}.json`)
  if (!existsSync(src)) continue
  const dir = path.join(root, 'dist', 'locales', lang)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'translation.json'), readFileSync(src, 'utf8'))
  copied++
}

console.log(`Copied ${copied} locale file(s) to dist/locales`)
