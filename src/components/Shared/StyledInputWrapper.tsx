import React, { FunctionComponent } from 'react'
import { Box, SxProps } from '@mui/system'
import { StyledInputError } from './StyledInputError'
import { Typography } from '@mui/material'

type StyledInputWrapperProps = {
  name: string
  error?: string
  infoLabel?: string | JSX.Element
  sx?: SxProps
}

export const StyledInputWrapper: FunctionComponent<StyledInputWrapperProps> = ({
  error,
  sx = { my: 4 },
  infoLabel,
  children,
}) => {
  return (
    <Box sx={sx}>
      {children}
      {Boolean(error) && <StyledInputError error={{ message: error }} />}
      {infoLabel && (
        <Typography variant="caption" component="p" color="text.secondary">
          {infoLabel}
        </Typography>
      )}
    </Box>
  )
}
