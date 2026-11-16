import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import { Field, type FieldProps } from '../Field/Field'
import fieldStyles from '../Field/Field.module.css'
import styles from './Textarea.module.css'

export type TextareaProps = FieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>

export function Textarea({ label, helper, error, className, rows = 4, ...rest }: TextareaProps) {
  return (
    <Field label={label} helper={helper} error={error} className={className}>
      {(control) => (
        <textarea
          className={cn(fieldStyles.control, styles.textarea)}
          rows={rows}
          {...control}
          {...rest}
        />
      )}
    </Field>
  )
}
