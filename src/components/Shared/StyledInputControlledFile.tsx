import React from 'react'
import { Controller } from 'react-hook-form'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import { StyledInputError } from './StyledInputError'
import { InfoMessage } from './InfoMessage'

type StyledInputControlledFileProps = {
  label: string

  name: string
  control?: any
  rules: any
  errors?: any
  infoLabel?: string
  inline?: boolean
}

export function StyledInputControlledFile({
  label,
  control,
  rules,
  errors,
  name,
  infoLabel,
  inline = false,
}: StyledInputControlledFileProps) {
  const hasFieldError = Boolean(!isEmpty(errors) && !isEmpty(get(errors, name)))

  const wrapOnFieldChange = (callback: any) => (e: any) => {
    callback(e.target.files)
  }

  return (
    <Controller
      shouldUnregister={true}
      name={name}
      control={control}
      rules={rules}
      render={({ field: { value, onChange, ...fieldProps } }) => (
        <Box sx={{ my: inline ? 0 : 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 3, flexShrink: 0, position: 'relative' }}>
              <input
                type="file"
                id={name}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
                {...fieldProps}
                onChange={wrapOnFieldChange(onChange)}
              />

              <Box
                component="label"
                htmlFor={name}
                sx={{
                  zIndex: 1,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 3,
                  py: 1.5,
                  position: 'relative',
                  borderRadius: 1,
                }}
                color="common.white"
                bgcolor="primary.main"
              >
                <Typography
                  component="span"
                  variant="body2"
                  color="common.white"
                  sx={{ fontWeight: 600 }}
                >
                  {label}
                </Typography>
              </Box>
            </Box>
            <Typography component="span" variant="caption">
              File selezionato:{' '}
              <Typography component="span" variant="inherit" sx={{ fontWeight: 700 }}>
                {value && value[0] ? value[0].name : 'nessun file selezionato'}
              </Typography>
            </Typography>
          </Box>

          {hasFieldError && <StyledInputError error={get(errors, name)} />}
          {infoLabel && <InfoMessage label={infoLabel} />}
        </Box>
      )}
    />
  )
}