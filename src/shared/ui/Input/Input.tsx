import type { InputHTMLAttributes } from 'react'
import { Field, type FieldProps } from '../Field/Field'
import fieldStyles from '../Field/Field.module.css'

export type InputProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>

export function Input({ label, helper, error, className, ...rest }: InputProps) {
  return (
    <Field label={label} helper={helper} error={error} className={className}>
      {(control) => <input className={fieldStyles.control} {...control} {...rest} />}
    </Field>
  )
}
