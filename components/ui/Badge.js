const COLORS = {
  green:  { bg: '#F0FDF4', text: '#16A34A' },
  orange: { bg: '#EFF6FF', text: '#1E3A5F' },
  red:    { bg: '#FEF2F2', text: '#DC2626' },
  blue:   { bg: '#EFF6FF', text: '#1E3A5F' },
  gray:   { bg: '#F1F5F9', text: '#475569' },
  navy:   { bg: '#EFF6FF', text: '#1E3A5F' },
  warn:   { bg: '#FEF9C3', text: '#854D0E' },
}

export default function Badge({ children, color = 'blue' }) {
  const c = COLORS[color] || COLORS.blue
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      background: c.bg,
      color: c.text,
    }}>
      {children}
    </span>
  )
}
