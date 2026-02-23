import { forwardRef } from 'react';

const variants = {
  primary: {
    background: 'var(--webex-blue)',
    color: '#07202E',
    border: 'none'
  },
  secondary: {
    background: 'rgba(0, 188, 240, 0.12)',
    color: 'var(--webex-blue)',
    border: '1px solid rgba(0, 188, 240, 0.3)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--webex-muted)',
    border: '1px solid var(--webex-border)'
  },
  danger: {
    background: 'var(--webex-red)',
    color: '#fff',
    border: 'none'
  },
  icon: {
    background: 'transparent',
    color: 'var(--webex-muted)',
    border: 'none'
  }
};

const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', className = '', disabled = false, onClick, style = {}, ...props },
  ref
) {
  const v = variants[variant] || variants.primary;
  const sizes = {
    sm: { padding: '4px 10px', fontSize: '12px', borderRadius: '6px' },
    md: { padding: '8px 16px', fontSize: '13px', borderRadius: '8px' },
    lg: { padding: '10px 22px', fontSize: '15px', borderRadius: '10px' },
    icon: { padding: '8px', fontSize: '13px', borderRadius: '8px' }
  };
  const s = sizes[size] || sizes.md;

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium cursor-pointer select-none transition-all duration-150 ${className}`}
      style={{
        ...v,
        ...s,
        opacity: disabled ? 0.45 : 1,
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'primary') e.currentTarget.style.filter = 'brightness(1.1)';
          if (variant === 'secondary') e.currentTarget.style.background = 'rgba(0, 188, 240, 0.2)';
          if (variant === 'ghost') e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          if (variant === 'icon') e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
          if (variant === 'danger') e.currentTarget.style.filter = 'brightness(1.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = '';
        if (variant === 'secondary') e.currentTarget.style.background = 'rgba(0, 188, 240, 0.12)';
        if (variant === 'ghost' || variant === 'icon') e.currentTarget.style.background = 'transparent';
      }}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
