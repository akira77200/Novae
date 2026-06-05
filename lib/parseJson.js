// lib/parseJson.js — Parse JSON from Claude responses (strips markdown fences, trailing commas, control chars)
export function parseClaudeJson(text) {
  let raw = (text || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim()

  const start = raw.indexOf('{')
  const end   = raw.lastIndexOf('}')
  if (start !== -1 && end > start) raw = raw.slice(start, end + 1)

  raw = raw.replace(/,\s*([}\]])/g, '$1')

  return JSON.parse(raw)
}
