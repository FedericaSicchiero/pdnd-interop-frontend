import React, { useContext, useEffect, useState } from 'react'
import { DialogProps, LangCode, ToastContentWithOutcome, ToastProps } from '../../types'
import { useHistory } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import {
  DialogContext,
  LangContext,
  LoaderContext,
  TableActionMenuContext,
  ToastContext,
} from '../lib/context'
import { logAction } from '../lib/action-log'
import { Header } from './Header'
import { Main } from './Main'
import { Footer } from './Footer'
import { StyledToast } from './Shared/StyledToast'
import { StyledDialog } from './Shared/StyledDialog'
import { LoadingOverlay } from './Shared/LoadingOverlay'
import { MainNav } from './MainNav'
import { Box } from '@mui/system'
import { useRoute } from '../hooks/useRoute'
import { buildLocale } from '../lib/validation-config'
import { useLogin } from '../hooks/useLogin'
import { DEFAULT_LANG, LANGUAGES } from '../lib/constants'
import { Typography } from '@mui/material'
import { Settings as SettingsIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { goToLoginPage } from '../lib/router-utils'
import { useJwt } from '../hooks/useJwt'

export function BodyLogger() {
  const { loginAttempt } = useLogin()
  const { routes, doesRouteAllowTwoColumnsLayout } = useRoute()
  const history = useHistory()
  const [toast, setToast] = useState<ToastProps | null>(null)
  const [dialog, setDialog] = useState<DialogProps | null>(null)
  const [loadingText, setLoadingText] = useState<string | null>(null)
  const [tableActionMenu, setTableActionMenu] = useState<string | null>(null)
  const { lang, setLang } = useContext(LangContext)
  const { jwt } = useJwt()
  const { i18n, t } = useTranslation('common')

  /*
   * Handle toast
   */
  useEffect(() => {
    // Avoid still showing the toast from last page
    if (toast) {
      setToast(null)
    }

    const locationState: Record<string, unknown> = history.location.state as Record<string, unknown>
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
  }, [history.location]) // eslint-disable-line react-hooks/exhaustive-deps

  /*
   * Handle data logging (now console.log, in the future might be Analytics)
   */
  useEffect(() => {
    logAction('Route change', history.location)
  }, [history.location])

  useEffect(() => {
    async function asyncLoginAttempt() {
      setLoadingText(t('loading.sessionToken.label'))
      await loginAttempt()
      setLoadingText(null)
    }

    asyncLoginAttempt()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onLanguageChanged = (newLang: LangCode) => {
    setLang(newLang)
    i18n.changeLanguage(newLang)
    buildLocale(t)
  }

  // Rebuild config if starting language is not the default one
  useEffect(() => {
    if (lang !== DEFAULT_LANG) {
      i18n.changeLanguage(lang)
      buildLocale(t)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TableActionMenuContext.Provider value={{ tableActionMenu, setTableActionMenu }}>
      <ToastContext.Provider value={{ toast, setToast }}>
        <DialogContext.Provider value={{ dialog, setDialog }}>
          <LoaderContext.Provider value={{ loadingText, setLoadingText }}>
            <Header
              onAssistanceClick={() => {
                history.push(routes.HELP.PATH)
              }}
              loggedUser={jwt}
              onLogin={goToLoginPage}
              subHeaderLeftComponent={
                <Typography component="span" variant="h5" fontWeight={700}>
                  {t('productTitle')}
                </Typography>
              }
              subHeaderRightComponent={
                // doesRouteAllowTwoColumnsLayout(history.location) && party !== null ? (
                //   <PartySelect />
                // ) : null
                null
              }
              userActions={[
                {
                  id: 'logout',
                  label: 'Logout',
                  onClick: () => {
                    history.push(routes.LOGOUT.PATH)
                  },
                  icon: <SettingsIcon fontSize="small" color="inherit" sx={{ mr: 1 }} />,
                },
              ]}
            />
            {doesRouteAllowTwoColumnsLayout(history.location) ? (
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', height: '100%', overflowX: 'hidden' }}>
                  <MainNav />
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      flexGrow: 1,
                      position: 'relative',
                      '::after': {
                        content: '""',
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bgcolor: 'background.default',
                        width: 10000,
                        height: '100%',
                        transform: 'translate(100%, 0)',
                      },
                    }}
                    bgcolor="background.default"
                  >
                    <Main />
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ flexGrow: 1 }}>
                <Main />
              </Box>
            )}
            <Footer
              loggedUser={jwt}
              currentLangCode={lang}
              onLanguageChanged={onLanguageChanged}
              languages={LANGUAGES}
              onExit={(href, linkType) => {
                if (linkType === 'internal') {
                  history.push(href)
                } else {
                  window.open(href, '_blank')
                }
              }}
            />
            {toast && <StyledToast {...toast} />}
            {dialog && <StyledDialog {...dialog} />}
            {loadingText && <LoadingOverlay loadingText={loadingText} />}
          </LoaderContext.Provider>
        </DialogContext.Provider>
      </ToastContext.Provider>
    </TableActionMenuContext.Provider>
  )
}
