import React, { FunctionComponent } from 'react'
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { Unstable_TrapFocus as TrapFocus } from '@mui/base'
import { StyledButton } from './StyledButton'
import { DialogBasicProps } from '../../../types'
import { useCloseDialog } from '../../hooks/useCloseDialog'

export const StyledDialogBasic: FunctionComponent<DialogBasicProps> = ({
  title = 'Conferma azione',
  description,
  proceedCallback,
  proceedLabel = 'Conferma',
  disabled = false,
  maxWidth,
}) => {
  const { closeDialog } = useCloseDialog()

  return (
    <TrapFocus open>
      <Dialog
        open={true}
        onClose={closeDialog}
        aria-describedby="Modale per azione"
        maxWidth={maxWidth}
        fullWidth
      >
        <DialogTitle>{title}</DialogTitle>

        {description && <DialogContent>{description}</DialogContent>}

        <DialogActions>
          <StyledButton variant="outlined" onClick={closeDialog}>
            Annulla
          </StyledButton>
          <StyledButton variant="contained" onClick={proceedCallback} disabled={disabled}>
            {proceedLabel}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </TrapFocus>
  )
}
