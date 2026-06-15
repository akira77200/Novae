const SIZES = {
  sm: { padding: '6px 14px',  fontSize: '0.8rem'  },
  md: { padding: '10px 20px', fontSize: '0.9rem'  },
  lg: { padding: '14px 28px', fontSize: '1rem'    },
}

const VARIANTS = {
  primary:   { background: 'var(--novae-primary-light)', color: '#fff',                          border: 'none'                                        },
  secondary: { background: 'transparent',                color: 'var(--novae-primary-light)',    border: '1.5px solid var(--novae-primary-light)'      },
  ghost:     { background: 'transparent',                color: 'var(--novae-text-secondary)',   border: 'none'                                        },
  danger:    { background: 'var(--novae-danger)',        color: '#fff',                          border: 'none'                                        },
}

export default function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...SIZES[size],
        ...VARIANTS[variant],
        borderRadius: 'var(--border-radius-sm)',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
        fontFamily: 'var(--font-display)',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
