import React from 'react'
import { useDialog } from '@/stores'
import { DialogRejectAgreementProps } from '@/types/dialog.types'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TextField } from '../shared/ReactHookFormInputs'
import { object, string } from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { AgreementMutations } from '@/api/agreement'

type RejectAgreementFormValues = {
  reason: string
}

export const DialogRejectAgreement: React.FC<DialogRejectAgreementProps> = ({ agreementId }) => {
  const { t } = useTranslation('shared-components', {
    keyPrefix: 'dialogRejectAgreement',
  })
  const { closeDialog } = useDialog()
  const { mutate: reject } = AgreementMutations.useReject()

  const validationSchema = object({
    reason: string().required(),
  })

  const formMethods = useForm<RejectAgreementFormValues>({
    defaultValues: { reason: '' },
    resolver: yupResolver(validationSchema),
  })

  const onSubmit = ({ reason }: RejectAgreementFormValues) => {
    reject({ agreementId, reason }, { onSuccess: closeDialog })
  }

  return (
    <Dialog open onClose={closeDialog} fullWidth>
      <FormProvider {...formMethods}>
        <Box component="form" onSubmit={formMethods.handleSubmit(onSubmit)}>
          <DialogTitle>{t('title')}</DialogTitle>

          <DialogContent>
            <TextField
              name="reason"
              label={t('content.reason.label')}
              infoLabel={t('content.reason.infoLabel')}
              focusOnMount
              multiline
              inputProps={{ maxLength: 1000 }}
            />
          </DialogContent>

          <DialogActions>
            <Button type="button" variant="outlined" onClick={closeDialog}>
              {t('actions.cancelLabel')}
            </Button>
            <Button variant="contained" type="submit">
              {t('actions.confirmLabel')}
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  )
}
