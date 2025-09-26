interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const Logo = ({ size = 'md', className }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  }

  return (
    <div className={`${className || ''}`}>
      <span
        className={`font-mono font-bold tracking-wide text-slate-800 dark:text-slate-100 ${sizeClasses[size]}`}
        style={{
          fontFamily:
            '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
          textShadow:
            '1px 1px 0px #3b82f6, 2px 2px 0px #6366f1, 3px 3px 0px #8b5cf6',
          letterSpacing: '0.1em',
          imageRendering: 'pixelated',
          WebkitFontSmoothing: 'none',
          MozOsxFontSmoothing: 'unset',
        }}
      >
        concat
      </span>
    </div>
  )
}

export default Logo
