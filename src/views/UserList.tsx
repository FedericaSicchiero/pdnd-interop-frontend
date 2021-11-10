import React, { useContext } from 'react'
import { useLocation } from 'react-router'
import { ProviderOrSubscriber, User, UserStatus, ActionProps } from '../../types'
import { StyledIntro } from '../components/Shared/StyledIntro'
import { TableWithLoader } from '../components/Shared/TableWithLoader'
import { useAsyncFetch } from '../hooks/useAsyncFetch'
import {
  ROUTES,
  USER_PLATFORM_ROLE_LABEL,
  USER_ROLE_LABEL,
  USER_STATUS_LABEL,
} from '../lib/constants'
import { useMode } from '../hooks/useMode'
import { TempFilters } from '../components/TempFilters'
import { isAdmin, isOperatorAPI, isOperatorSecurity } from '../lib/auth-utils'
import { PartyContext, UserContext } from '../lib/context'
import { buildDynamicPath, getLastBit } from '../lib/url-utils'
import { useFeedback } from '../hooks/useFeedback'
import { StyledButton } from '../components/Shared/StyledButton'
import { StyledLink } from '../components/Shared/StyledLink'
import { Box } from '@mui/system'
import { StyledTableRow } from '../components/Shared/StyledTableRow'

export function UserList() {
  const { runAction, wrapActionInDialog, forceRerenderCounter } = useFeedback()
  const clientId = getLastBit(useLocation()) // Only for subscriber

  const mode = useMode()
  const { party } = useContext(PartyContext)
  const { user } = useContext(UserContext)
  const endpoint = mode === 'provider' ? 'OPERATOR_API_GET_LIST' : 'OPERATOR_SECURITY_GET_LIST'
  const endpointParams =
    mode === 'provider' ? { institutionId: party?.institutionId } : { clientId }

  const { data, loadingText, error } = useAsyncFetch<User[]>(
    { path: { endpoint, endpointParams } },
    {
      defaultValue: [],
      useEffectDeps: [forceRerenderCounter, user],
      // TEMP BACKEND: Waiting for new onboarding API with user filtering
      mapFn: (data) => {
        if (isOperatorSecurity(party) || isOperatorAPI(party)) {
          return data.filter((d) => d.taxCode === user?.taxCode)
        }

        if (mode === 'subscriber') {
          return data.filter((d) => d.platformRole === 'security')
        }

        return data.filter((d) => ['admin', 'api'].includes(d.platformRole))
      },
      loaderType: 'contextual',
      loadingTextLabel: 'Stiamo caricando gli operatori',
    }
  )

  /*
   * List of possible actions for the user to perform
   */
  const wrapSuspend = (taxCode: string) => async (_: any) => {
    await runAction(
      {
        path: {
          endpoint: 'USER_SUSPEND',
          endpointParams: { taxCode, institutionId: party?.institutionId },
        },
        config: {
          data: { platformRole: mode === 'provider' ? 'api' : 'security' },
        },
      },
      { suppressToast: false }
    )
  }

  const wrapReactivate = (taxCode: string) => async (_: any) => {
    await runAction(
      {
        path: {
          endpoint: 'USER_REACTIVATE',
          endpointParams: { taxCode, institutionId: party?.institutionId },
        },
        config: {
          data: { platformRole: mode === 'provider' ? 'api' : 'security' },
        },
      },
      { suppressToast: false }
    )
  }
  /*
   * End list of actions
   */

  // Build list of available actions for each service in its current state
  const getAvailableActions = (user: User) => {
    const suspendAction = {
      btnProps: {
        onClick: wrapActionInDialog(
          wrapSuspend((user.taxCode || user.from) as string),
          'USER_SUSPEND'
        ),
      },
      label: 'Sospendi',
    }
    const reactivateAction = {
      btnProps: {
        onClick: wrapActionInDialog(
          wrapReactivate((user.taxCode || user.from) as string),
          'USER_REACTIVATE'
        ),
      },
      label: 'Riattiva',
    }

    const availableActions: { [key in UserStatus]: ActionProps[] } = {
      pending: [],
      active: [suspendAction],
      suspended: [reactivateAction],
    }

    // Return all the actions available for this particular status
    return availableActions[party!.status] || []
  }

  // TEMP BACKEND: this should not happen, it depends on the difference between our API
  // and the one shared with self care, that doesn't expose name and surname
  const headData = [
    mode === 'provider' ? 'codice fiscale' : 'nome e cognome',
    'ruolo',
    'permessi',
    'stato',
    '',
  ]

  /*
   * Labels and buttons dependant on the current mode
   */
  const TITLES: { [key in ProviderOrSubscriber]: { title: string; description: string } } = {
    provider: {
      title: "Operatori API dell'ente",
      description:
        "In quest’area puoi trovare e gestire tutti gli operatori API che sono stati abilitati alla gestione degli e-service dell'ente",
    },
    subscriber: {
      title: 'Operatori di sicurezza del client',
      description:
        'In quest’area puoi trovare e gestire tutti gli operatori di sicurezza che sono stati abilitati a gestire le chiavi per il tuo client',
    },
  }

  const CREATE_ACTIONS = {
    provider: ROUTES.PROVIDE.SUBROUTES!.OPERATOR.SUBROUTES!.CREATE,
    subscriber: ROUTES.SUBSCRIBE.SUBROUTES!.OPERATOR_SECURITY_CREATE,
  }
  /*
   * End labels and buttons
   */

  return (
    <React.Fragment>
      <StyledIntro>{TITLES[mode!]}</StyledIntro>

      <Box sx={{ mt: 4 }}>
        {isAdmin(party) && (
          <StyledButton
            variant="contained"
            component={StyledLink}
            to={`${CREATE_ACTIONS[mode!].PATH}${
              mode === 'subscriber' ? `?clientId=${clientId}` : ''
            }`}
          >
            + Aggiungi
          </StyledButton>
        )}

        <TempFilters />

        <TableWithLoader
          loadingText={loadingText}
          headData={headData}
          pagination={true}
          data={data}
          noDataLabel="Non ci sono operatori disponibili"
          error={error}
        >
          {data?.map((item, i) => (
            <StyledTableRow
              key={i}
              cellData={[
                /*
                 * TEMP BACKEND: this should not happen, it depends on the difference between our API
                 * and the one shared with self care, that doesn't expose name and surname
                 */
                { label: mode === 'provider' ? item.from! : `${item.name + ' ' + item.surname}` },
                { label: USER_ROLE_LABEL[item.role] },
                { label: USER_PLATFORM_ROLE_LABEL[item.platformRole] },
                { label: USER_STATUS_LABEL[item.status] },
              ]}
              index={i}
              singleActionBtn={{
                props: {
                  to:
                    mode === 'provider'
                      ? buildDynamicPath(ROUTES.PROVIDE.SUBROUTES!.OPERATOR.SUBROUTES!.EDIT.PATH, {
                          id: (item.taxCode || item.from) as string,
                        })
                      : buildDynamicPath(ROUTES.SUBSCRIBE.SUBROUTES!.OPERATOR_SECURITY_EDIT.PATH, {
                          clientId,
                          operatorId: item.taxCode,
                        }),
                  component: StyledLink,
                },
                label: '',
              }}
              actions={getAvailableActions(item)}
            />
          ))}
        </TableWithLoader>
      </Box>
    </React.Fragment>
  )
}
