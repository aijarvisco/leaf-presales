'use client'
import { forwardRef } from 'react'
import type { ButtonVariant } from '@/types'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  href?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-blue-600 border border-accent',
  ghost: 'bg-transparent text-white border border-white/30 hover:border-white',
  outline: 'bg-transparent text-accent border border-accent hover:bg-accent hover:text-white',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center px-8 py-3
        text-lg font-normal rounded-lg
        transition-all duration-200 cursor-pointer
        ${variantClasses[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = 'Button'
export default Button
