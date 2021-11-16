import React from 'react'
import isEmpty from 'lodash/isEmpty'
import get from 'lodash/get'
import { Controller } from 'react-hook-form'
import { InputBaseComponentProps, TextField } from '@mui/material'
import { StyledInputWrapper } from './StyledInputWrapper'

export type StyledInputTextType = 'text' | 'email' | 'number'

type StyledInputControlledTextProps = {
  label?: string
  disabled?: boolean
  infoLabel?: string

  name: string
  defaultValue?: string
  control: any
  rules?: any
  errors: any

  inputProps?: InputBaseComponentProps
  type?: StyledInputTextType
  multiline?: boolean
  rows?: number
  focusOnMount?: boolean
  sx?: any
}

export function StyledInputControlledText({
  label,
  disabled = false,
  infoLabel,

  name,
  defaultValue = '',
  control,
  rules = {},
  errors,

  inputProps,
  type = 'text',
  multiline = false,
  rows = 6,
  focusOnMount = false,
  sx,
}: StyledInputControlledTextProps) {
  const hasFieldError = Boolean(!isEmpty(errors) && !isEmpty(get(errors, name)))

  return (
    <StyledInputWrapper
      name={name}
      errors={errors}
      sx={sx}
      infoLabel={infoLabel}
      hasFieldError={hasFieldError}
    >
      <Controller
        shouldUnregister={true}
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={rules}
        render={({ field }) => (
          <TextField
            autoFocus={focusOnMount}
            multiline={multiline}
            rows={multiline ? rows : 1}
            disabled={disabled}
            sx={{ width: '100%' }}
            variant="standard"
            label={label}
            type={type}
            error={hasFieldError}
            {...field}
            inputProps={inputProps}
          />
        )}
      />
    </StyledInputWrapper>
  )
}
