const COLORS = {
  green:  { bg: '#F0F0EE', text: '#3A3D40' },
  orange: { bg: '#F0F0EE', text: '#3A3D40' },
  red:    { bg: '#FEF2F2', text: '#DC2626' },
  blue:   { bg: '#F0F0EE', text: '#3A3D40' },
  gray:   { bg: '#F7F7F5', text: '#6B6F76' },
  navy:   { bg: '#F0F0EE', text: '#0E1116' },
  warn:   { bg: '#F7F7F5', text: '#6B6F76' },
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
