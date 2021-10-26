import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES, USER_ROLE_LABEL } from '../lib/constants'
import { PartyContext, UserContext } from '../lib/context'
import { storageWrite } from '../lib/storage-utils'
import { Layout } from './Shared/Layout'
import { StyledButton } from './Shared/StyledButton'
import logo from '../assets/pagopa-logo-white.svg'
import { Box } from '@mui/system'
import { MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'

export function Header() {
  const { party, availableParties, setParty } = useContext(PartyContext)
  const { user } = useContext(UserContext)
  const { PATH: btnPath, LABEL: btnLabel } = user ? ROUTES.LOGOUT : ROUTES.LOGIN

  const updateActiveParty = (event: SelectChangeEvent<string>) => {
    const newPartyInstitutionId = event.target.value
    const newParty = availableParties.find((p) => p.institutionId === newPartyInstitutionId)
    setParty(newParty!)
    storageWrite('currentParty', newParty!, 'object')
  }

  return (
    <header>
      <Box sx={{ bgcolor: 'primary.dark' }}>
        <Layout>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: '1.5rem',
            }}
          >
            <Link to="/">
              <img src={logo} alt="Logo PagoPA" />
            </Link>
            <StyledButton variant="contained" component={Link} to={btnPath}>
              {btnLabel}
            </StyledButton>
          </Box>
        </Layout>
      </Box>

      <Box sx={{ bgcolor: 'primary.main' }}>
        <Layout>
          <div className="d-flex justify-content-between align-items-center">
            <Box sx={{ color: 'common.white', py: '1.5rem' }}>
              <Typography variant="h4">Interoperabilità</Typography>
              <Typography variant="caption">Il catalogo degli e-service delle PA</Typography>
            </Box>

            {party !== null && (
              <Select
                sx={{ color: 'common.white', minWidth: 260 }}
                value={party!.institutionId}
                label="Ente operante"
                onChange={updateActiveParty}
              >
                {availableParties.map((availableParty, i) => (
                  <MenuItem key={i} value={availableParty.institutionId}>
                    {availableParty.description}
                    <br />
                    {USER_ROLE_LABEL[availableParty.role]}
                  </MenuItem>
                ))}
              </Select>
            )}
          </div>
        </Layout>
      </Box>
    </header>
  )
}
