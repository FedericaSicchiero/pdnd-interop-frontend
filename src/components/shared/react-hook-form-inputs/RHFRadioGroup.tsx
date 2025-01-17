import React, { useId } from 'react'
import {
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup as MUIRadioGroup,
  RadioGroupProps as MUIRadioGroupProps,
} from '@mui/material'
import { InputWrapper } from '../InputWrapper'
import { Controller, useFormContext } from 'react-hook-form'
import { InputOption } from '@/types/common.types'
import { ControllerProps } from 'react-hook-form/dist/types'
import { useTranslation } from 'react-i18next'
import { mapValidationErrorMessages } from '@/utils/validation.utils'

export type RHFRadioGroupProps = Omit<MUIRadioGroupProps, 'onChange'> & {
  label: string
  options: Array<InputOption & { disabled?: boolean }>
  name: string
  infoLabel?: string
  disabled?: boolean
  rules?: ControllerProps['rules']
  onValueChange?: (value: string) => void
}

export const RHFRadioGroup: React.FC<RHFRadioGroupProps> = ({
  sx,
  name,
  label,
  options,
  infoLabel,
  disabled,
  rules,
  onValueChange,
  ...props
}) => {
  const { formState } = useFormContext()
  const labelId = useId()
  const { t } = useTranslation()

  if (!options || options.length === 0) {
    return null
  }

  const error = formState.errors[name]?.message as string | undefined

  return (
    <InputWrapper error={error} sx={sx} infoLabel={infoLabel}>
      <FormLabel id={labelId}>{label}</FormLabel>
      <Controller
        name={name}
        rules={mapValidationErrorMessages(rules, t)}
        render={({ field: { onChange, ...fieldProps } }) => (
          <MUIRadioGroup
            aria-labelledby={labelId}
            {...props}
            {...fieldProps}
            onChange={(_, value) => {
              if (onValueChange) onValueChange(value)
              onChange(value)
            }}
          >
            {options.map((o) => (
              <FormControlLabel
                disabled={disabled || o.disabled}
                key={o.value}
                value={o.value}
                control={<Radio />}
                label={o.label}
                sx={{ mr: 3 }}
              />
            ))}
          </MUIRadioGroup>
        )}
      />
    </InputWrapper>
  )
}
