const COLORS = {
  green:  { bg: '#DBEAFE', text: '#1E3A5F' },
  orange: { bg: '#FFF3CD', text: '#856404' },
  red:    { bg: '#F8D7DA', text: '#721C24' },
  blue:   { bg: '#D1ECF1', text: '#0C5460' },
  gray:   { bg: '#E9ECEF', text: '#495057' },
}

export default function Badge({ children, color = 'green' }) {
  const c = COLORS[color] || COLORS.green
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: '99px',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: c.bg,
      color: c.text,
    }}>
      {children}
    </span>
  )
}
