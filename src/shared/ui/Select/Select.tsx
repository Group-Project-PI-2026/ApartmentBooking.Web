import type { SelectHTMLAttributes } from 'react'
import chevronDown from '@/shared/assets/icons/chevron-down.svg'
import { cn } from '@/shared/lib/cn'
import { Field, type FieldProps } from '../Field/Field'
import fieldStyles from '../Field/Field.module.css'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
}

export type SelectProps = FieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
    options: SelectOption[]
    placeholder?: string
  }

export function Select({
  label,
  helper,
  error,
  className,
  options,
  placeholder,
  value,
  defaultValue,
  ...rest
}: SelectProps) {
  const isControlled = value !== undefined
  const isEmpty = isControlled ? value === '' : false

  return (
    <Field label={label} helper={helper} error={error} className={className}>
      {(control) => (
        <div className={fieldStyles.withTrailing}>
          <select
            className={cn(fieldStyles.control, styles.select, isEmpty && styles.empty)}
            value={value}
            defaultValue={
              isControlled ? undefined : (defaultValue ?? (placeholder ? '' : undefined))
            }
            {...control}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className={fieldStyles.trailing} aria-hidden>
            <img src={chevronDown} alt="" />
          </span>
        </div>
      )}
    </Field>
  )
}
