import SAFE_LINKS from '../lib/safeLinks'
import { useApp } from '../context/AppContext'

export default function SafeLink({
  linkKey,
  customUrl,
  customName,
  children,
  style,
}) {
  const { lang } = useApp()

  let url = customUrl
  let hint = null
  let name = customName

  if (linkKey && SAFE_LINKS[linkKey]) {
    const link = SAFE_LINKS[linkKey]
    url = link.url
    hint = link.description[lang] || link.description.fr
    name = name || link.name
  }

  if (!url || url === '#') {
    return (
      <span style={{ color: '#888', fontSize: '0.85rem', ...style }}>
        {children || name}
      </span>
    )
  }

  return (
    <div style={{ display: 'inline-block' }}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#1E3A5F', textDecoration: 'underline', fontWeight: 500, ...style }}
      >
        {children || name} →
      </a>
      {hint && (
        <span style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginTop: '2px', fontStyle: 'italic' }}>
          💡 {hint}
        </span>
      )}
    </div>
  )
}
