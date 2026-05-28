/*
 * Reports translation keys that are referenced from `src/` via `t('…')`
 * but are missing from one or more `locales/{lang}.json` files.
 *
 * Limitations: only static string literals inside `t()` are detected
 * (`t('actions.save')` is found; `t(\`actions.\${kind}\`)` is not).
 */
const { existsSync, readFileSync, readdirSync, statSync } = require('fs')
const path = require('path')

const LANGS = ['es', 'en', 'it', 'fr', 'pt', 'tr']
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'src')

/** Recursively collect all .ts/.tsx files under a directory. */
function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry)
    const s = statSync(p)
    if (s.isDirectory()) {
      if (entry === 'node_modules' || entry === '__tests__') continue
      out.push(...walk(p))
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      out.push(p)
    }
  }
  return out
}

/**
 * Match `t('key')` / `t("key")` / `i18n.t('key')` with a static string literal
 * as the first argument. Skips template strings and dynamic expressions.
 */
const T_CALL = /\b(?:i18n\.)?t\(\s*(['"])((?:(?!\1).)+)\1/g

function extractKeysFromFile(file) {
  const text = readFileSync(file, 'utf8')
  const keys = new Set()
  let m
  while ((m = T_CALL.exec(text)) !== null) {
    keys.add(m[2])
  }
  return keys
}

/** Walk a nested object using a dot-separated path; return true if the leaf exists. */
function hasKey(obj, dotted) {
  const parts = dotted.split('.')
  let cur = obj
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object' || !(part in cur)) return false
    cur = cur[part]
  }
  return true
}

function loadLocale(lang) {
  const file = path.join(ROOT, 'locales', `${lang}.json`)
  if (!existsSync(file)) return null
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (err) {
    console.error(`Failed to parse ${file}: ${err.message}`)
    return null
  }
}

// --- Main -------------------------------------------------------------------

const files = walk(SRC)
const allKeys = new Set()
for (const file of files) {
  for (const key of extractKeysFromFile(file)) allKeys.add(key)
}

console.log(`Found ${allKeys.size} static t() keys in ${files.length} files.\n`)

let totalMissing = 0
for (const lang of LANGS) {
  const locale = loadLocale(lang)
  if (locale == null) {
    console.log(`⚠️  ${lang}.json: missing or invalid`)
    continue
  }
  const missing = [...allKeys].filter((k) => !hasKey(locale, k)).sort()
  if (missing.length === 0) {
    console.log(`✅ ${lang}: all ${allKeys.size} keys present`)
  } else {
    totalMissing += missing.length
    console.log(`❌ ${lang}: ${missing.length} missing`)
    for (const k of missing) console.log(`   - ${k}`)
  }
}

process.exit(totalMissing === 0 ? 0 : 1)
