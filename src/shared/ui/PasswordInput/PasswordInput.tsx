import { useState, type InputHTMLAttributes } from 'react'
import eyeOffIcon from '@/shared/assets/icons/eye-off.svg'
import eyeIcon from '@/shared/assets/icons/eye.svg'
import { Field, type FieldProps } from '../Field/Field'
import fieldStyles from '../Field/Field.module.css'

export type PasswordInputProps = FieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'>

export function PasswordInput({ label, helper, error, className, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <Field label={label} helper={helper} error={error} className={className}>
      {(control) => (
        <div className={fieldStyles.withTrailing}>
          <input
            type={visible ? 'text' : 'password'}
            className={fieldStyles.control}
            {...control}
            {...rest}
          />
          <button
            type="button"
            className={fieldStyles.trailing}
            onClick={() => setVisible((v) => !v)}
            disabled={rest.disabled}
            aria-label={visible ? 'Сховати пароль' : 'Показати пароль'}
            aria-pressed={visible}
          >
            <img src={visible ? eyeIcon : eyeOffIcon} alt="" />
          </button>
        </div>
      )}
    </Field>
  )
}
