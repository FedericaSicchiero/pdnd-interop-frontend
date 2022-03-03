import React, { useEffect, useState } from 'react'
import { DialogProps, ToastContentWithOutcome, ToastProps } from '../../types'
import { useLocation } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import { DialogContext, LoaderContext, TableActionMenuContext, ToastContext } from '../lib/context'
import { logAction } from '../lib/action-log'
import { Header } from './Header'
import { Main } from './Main'
import { Footer } from './Footer'
import { StyledToast } from './Shared/StyledToast'
import { StyledDialog } from './Shared/StyledDialog'
import { LoadingOverlay } from './Shared/LoadingOverlay'
import { MainNav } from './MainNav'
import { Layout } from './Shared/Layout'
import { Box } from '@mui/system'
import { useRoute } from '../hooks/useRoute'
import '../lib/validation-config'
import { Grid } from '@mui/material'
import { useLogin } from '../hooks/useLogin'

export function BodyLogger() {
  const { loginAttempt } = useLogin()
  const [toast, setToast] = useState<ToastProps | null>(null)
  const [dialog, setDialog] = useState<DialogProps | null>(null)
  const [loadingText, setLoadingText] = useState<string | null>(null)
  const [tableActionMenu, setTableActionMenu] = useState<string | null>(null)
  const location = useLocation()
  const { doesRouteAllowTwoColumnsLayout } = useRoute()

  /*
   * Handle toast
   */
  useEffect(() => {
    // Avoid still showing the toast from last page
    if (toast) {
      setToast(null)
    }

    const locationState: Record<string, unknown> = location.state as Record<string, unknown>
    // If there is explicitly a new toast to show on this page, display it
    if (!isEmpty(locationState) && !isEmpty(locationState.toast)) {
      const toastContent = locationState.toast as ToastContentWithOutcome
      setToast({
        ...toastContent,
        onClose: () => {
          setToast(null)
        },
      })
    }
  }, [location]) // eslint-disable-line react-hooks/exhaustive-deps

  /*
   * Handle data logging (now console.log, in the future might be Analytics)
   */
  useEffect(() => {
    logAction('Route change', location)
  }, [location])

  useEffect(() => {
    loginAttempt()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TableActionMenuContext.Provider value={{ tableActionMenu, setTableActionMenu }}>
      <ToastContext.Provider value={{ toast, setToast }}>
        <DialogContext.Provider value={{ dialog, setDialog }}>
          <LoaderContext.Provider value={{ loadingText, setLoadingText }}>
            <Header />
            {doesRouteAllowTwoColumnsLayout(location) ? (
              <Box sx={{ flexGrow: 1 }} bgcolor="#F5F6F7">
                <Layout sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', height: '100%' }}>
                    <MainNav />
                    <Box sx={{ py: 10, pl: 4, flexGrow: 1, maxWidth: 1024 }}>
                      <Main />
                    </Box>
                  </Box>
                </Layout>
              </Box>
            ) : (
              <Box sx={{ flexGrow: 1 }}>
                <Grid container sx={{ display: 'flex', justifyContent: 'center', py: 10, px: 4 }}>
                  <Grid item xs={8}>
                    <Layout>
                      <Main />
                    </Layout>
                  </Grid>
                </Grid>
              </Box>
            )}
            <Footer />
            {toast && <StyledToast {...toast} />}
            {dialog && <StyledDialog {...dialog} />}
            {loadingText && <LoadingOverlay loadingText={loadingText} />}
          </LoaderContext.Provider>
        </DialogContext.Provider>
      </ToastContext.Provider>
    </TableActionMenuContext.Provider>
  )
}
