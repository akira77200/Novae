import { useApp } from '../../context/AppContext'

export default function Card({ children, style, padding = '20px' }) {
  const { theme } = useApp()
  return (
    <div style={{
      background: theme === 'dark' ? 'var(--novae-surface-dark)' : 'var(--novae-surface)',
      borderRadius: 'var(--border-radius)',
      border: `1px solid ${theme === 'dark' ? 'var(--novae-border-dark)' : 'var(--novae-border)'}`,
      boxShadow: 'var(--shadow-sm)',
      padding,
      ...style,
    }}>
      {children}
    </div>
  )
}
