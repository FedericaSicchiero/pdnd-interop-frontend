import React, { useContext } from 'react'
import { Client, ClientStatus, ActionProps } from '../../types'
import { StyledIntro } from '../components/Shared/StyledIntro'
import { TableWithLoader } from '../components/Shared/TableWithLoader'
import { TempFilters } from '../components/TempFilters'
import { useAsyncFetch } from '../hooks/useAsyncFetch'
import { getClientComputedStatus } from '../lib/status-utils'
import { isAdmin, isOperatorSecurity } from '../lib/auth-utils'
import { COMPUTED_STATUS_LABEL, ROUTES } from '../lib/constants'
import { PartyContext, UserContext } from '../lib/context'
import { useFeedback } from '../hooks/useFeedback'
import { buildDynamicPath } from '../lib/url-utils'
import { StyledButton } from '../components/Shared/StyledButton'
import { StyledLink } from '../components/Shared/StyledLink'
import { TableCell, TableRow } from '@mui/material'
import { Box } from '@mui/system'
import { ActionMenu } from '../components/Shared/ActionMenu'

export function ClientList() {
  const { runAction, wrapActionInDialog, forceRerenderCounter } = useFeedback()
  const { user } = useContext(UserContext)
  const { party } = useContext(PartyContext)
  const { data, loadingText, error } = useAsyncFetch<Client[]>(
    {
      path: { endpoint: 'CLIENT_GET_LIST' },
      config: {
        params: {
          institutionId: party?.institutionId,
          operatorTaxCode: isOperatorSecurity(party) ? user?.taxCode : undefined,
        },
      },
    },
    {
      defaultValue: [],
      useEffectDeps: [forceRerenderCounter, user],
      loaderType: 'contextual',
      loadingTextLabel: 'Stiamo caricando i client',
    }
  )

  /*
   * List of possible actions for the user to perform
   */
  const wrapSuspend = (clientId: string) => async (_: any) => {
    await runAction(
      {
        path: { endpoint: 'CLIENT_SUSPEND', endpointParams: { clientId } },
      },
      { suppressToast: false }
    )
  }

  const wrapReactivate = (clientId: string) => async (_: any) => {
    await runAction(
      {
        path: { endpoint: 'CLIENT_ACTIVATE', endpointParams: { clientId } },
      },
      { suppressToast: false }
    )
  }
  /*
   * End list of actions
   */

  // Build list of available actions for each service in its current state
  const getAvailableActions = (client: Client): ActionProps[] => {
    // Exit early if user cannot perform actions
    if (!isAdmin(party)) {
      return []
    }

    const availableActions: { [key in ClientStatus]: ActionProps[] } = {
      active: [
        {
          onClick: wrapActionInDialog(wrapSuspend(client.id), 'CLIENT_SUSPEND'),
          label: 'Sospendi client',
        },
      ],
      suspended: [
        {
          onClick: wrapActionInDialog(wrapReactivate(client.id), 'CLIENT_ACTIVATE'),
          label: 'Riattiva client',
        },
      ],
    }

    const status = client.status

    // Return all the actions available for this particular status
    return (availableActions as any)[status] || []
  }

  const headData = ['nome client', 'nome e-service', 'ente erogatore', 'stato', '']

  return (
    <React.Fragment>
      <StyledIntro>
        {{
          title: 'I tuoi client',
          description: "In quest'area puoi i trovare e gestire tutti i client che hai creato",
        }}
      </StyledIntro>

      <div className="mt-4">
        {isAdmin(party) && (
          <StyledButton
            variant="contained"
            component={StyledLink}
            to={ROUTES.SUBSCRIBE.SUBROUTES!.CLIENT_CREATE.PATH}
          >
            {ROUTES.SUBSCRIBE.SUBROUTES!.CLIENT_CREATE.LABEL}
          </StyledButton>
        )}

        <TempFilters />

        <TableWithLoader
          loadingText={loadingText}
          headData={headData}
          pagination={true}
          data={data}
          noDataLabel="Non ci sono client disponibili"
          error={error}
        >
          {data.map((item, i) => (
            <TableRow key={i} sx={{ bgcolor: 'common.white' }}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.eservice.name}</TableCell>
              <TableCell>{item.eservice.provider.description}</TableCell>
              <TableCell>{COMPUTED_STATUS_LABEL[getClientComputedStatus(item)]}</TableCell>

              <TableCell>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <StyledButton
                    variant="outlined"
                    to={buildDynamicPath(ROUTES.SUBSCRIBE.SUBROUTES!.CLIENT_EDIT.PATH, {
                      id: item.id,
                    })}
                    component={StyledLink}
                  >
                    Ispeziona
                  </StyledButton>

                  <ActionMenu actions={getAvailableActions(item)} index={i} />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableWithLoader>
      </div>
    </React.Fragment>
  )
}
