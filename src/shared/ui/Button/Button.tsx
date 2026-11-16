import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cn } from '@/shared/lib/cn'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'destructive'
export type ButtonSize = 'regular' | 'compact'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  fullWidth?: boolean
}

function classes(
  { variant = 'primary', size = 'regular', fullWidth }: CommonProps,
  extra?: string,
) {
  return cn(
    styles.button,
    styles[variant],
    size === 'compact' && styles.compact,
    fullWidth && styles.fullWidth,
    extra,
  )
}

export type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant,
  size,
  icon,
  fullWidth,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={classes({ variant, size, fullWidth }, className)} {...rest}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  )
}

export type ButtonLinkProps = CommonProps & LinkProps

export function ButtonLink({
  variant,
  size,
  icon,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={classes({ variant, size, fullWidth }, className)} {...rest}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </Link>
  )
}
