export function go(path: string) {
  location.hash = path
}

export function back(fallback = '/') {
  if (history.length > 1) history.back()
  else go(fallback)
}
