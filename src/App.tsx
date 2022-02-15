import React, { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import CssBaseline from '@mui/material/CssBaseline'
import { BodyLogger } from './components/BodyLogger'
import { PartyContext, TokenContext } from './lib/context'
import { Party } from '../types'
import { ThemeProvider } from '@mui/material'
import theme from '@pagopa/mui-italia/theme'
import DateAdapter from '@mui/lab/AdapterDateFns'
import { LocalizationProvider } from '@mui/lab'

export function App() {
  const [token, setToken] = useState<string | null>(null)
  const [party, setParty] = useState<Party | null>(null)
  const [availableParties, setAvailableParties] = useState<Array<Party> | null>(null)

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      <PartyContext.Provider value={{ party, availableParties, setParty, setAvailableParties }}>
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <BodyLogger />
            </ThemeProvider>
          </LocalizationProvider>
        </BrowserRouter>
      </PartyContext.Provider>
    </TokenContext.Provider>
  )
}
