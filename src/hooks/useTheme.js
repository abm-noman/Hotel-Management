import { useEffect, useState } from 'react'

// First visit follows the system setting; after that the saved choice wins.
const initial = () =>
  document.documentElement.dataset.theme ||
  (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

export default function useTheme() {
  const [theme, setTheme] = useState(initial)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('theme', theme) } catch {}
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}
