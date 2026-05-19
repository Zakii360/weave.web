export function lex(source) {
  return source
    .split(/\s+/)
    .filter(Boolean)
    .map(token => ({
      type: 'WORD',
      value: token
    }))
}
