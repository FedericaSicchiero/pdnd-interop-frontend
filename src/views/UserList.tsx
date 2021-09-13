import React, { useContext } from 'react'
import compose from 'lodash/fp/compose'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {
  AgreementStatus,
  ProviderOrSubscriber,
  TableActionBtn,
  TableActionLink,
  TableActionProps,
  User,
} from '../../types'
import { StyledIntro } from '../components/StyledIntro'
import { TableAction } from '../components/TableAction'
import { TableWithLoader } from '../components/TableWithLoader'
import { WhiteBackground } from '../components/WhiteBackground'
import { UserFeedbackHOCProps, withUserFeedback } from '../components/withUserFeedback'
import { useAsyncFetch } from '../hooks/useAsyncFetch'
import {
  ROUTES,
  USER_PLATFORM_ROLE_LABEL,
  USER_ROLE_LABEL,
  USER_STATUS_LABEL,
} from '../lib/constants'
import { useMode } from '../hooks/useMode'
import { withToastOnMount } from '../components/withToastOnMount'
import { TempFilters } from '../components/TempFilters'
import { isAdmin } from '../lib/auth-utils'
import { UserContext } from '../lib/context'

function UserListComponent({
  runFakeAction,
  wrapActionInDialog,
  forceRerenderCounter,
}: UserFeedbackHOCProps) {
  const mode = useMode()
  const { user } = useContext(UserContext)
  const { data, loading, error } = useAsyncFetch<User[]>(
    {
      path: { endpoint: 'USER_GET_LIST' },
      config: { method: 'GET' }, // TEMP PIN-219: users must be filtered by clientId or instutitionId
    },
    { defaultValue: [], useEffectDeps: [forceRerenderCounter] }
  )

  /*
   * List of possible actions for the user to perform
   */
  const wrapSuspend = (taxCode: string) => async (_: any) => {
    runFakeAction('Sospendi utente ' + taxCode)
  }

  const wrapReactivate = (taxCode: string) => async (_: any) => {
    runFakeAction('Riattiva utente ' + taxCode)
  }
  /*
   * End list of actions
   */

  // Build list of available actions for each service in its current state
  const getAvailableActions = (user: User) => {
    const availableActions: { [key in AgreementStatus]: TableActionProps[] } = {
      pending: [],
      active: [
        {
          onClick: wrapActionInDialog(wrapSuspend(user.taxCode)),
          label: 'sospendi',
          icon: 'bi-pause-circle',
          isMock: true,
        },
      ],
      suspended: [
        {
          onClick: wrapActionInDialog(wrapReactivate(user.taxCode)),
          label: 'riattiva',
          icon: 'bi-play-circle',
          isMock: true,
        },
      ],
    }

    const status = user.status

    const inspectAction = {
      to: `${ROUTES[mode === 'provider' ? 'PROVIDE' : 'SUBSCRIBE'].SUBROUTES!.USER_LIST.PATH}/${
        user.taxCode
      }`,
      icon: 'bi-info-circle',
      label: 'Ispeziona',
    }

    // Get all the actions available for this particular status
    const actions: TableActionProps[] = (availableActions as any)[status] || []

    // Add the last action, which is always EDIT/INSPECT
    actions.push(inspectAction)

    return actions
  }

  const headData = [
    'nome e cognome',
    'codice fiscale',
    'contatto email',
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
      title: 'I tuoi operatori API',
      description:
        'In quest’area puoi trovare e gestire tutti gli accordi di operatori API che sono stati abilitati a tenere aggiornate le tue API',
    },
    subscriber: {
      title: 'I tuoi operatori di sicurezza',
      description:
        'In quest’area puoi trovare e gestire tutti gli operatori di sicurezza che sono stati abilitati a gestire le chiavi per il tuo client',
    },
  }

  const CREATE_ACTIONS = {
    provider: ROUTES.PROVIDE.SUBROUTES!.USER_CREATE,
    subscriber: ROUTES.SUBSCRIBE.SUBROUTES!.USER_CREATE,
  }
  /*
   * End labels and buttons
   */

  return (
    <WhiteBackground>
      <StyledIntro additionalClasses="fakeData fakeDataStart">{TITLES[mode!]}</StyledIntro>

      <div className="mt-4">
        {isAdmin(user) && (
          <Button variant="primary" as={Link} to={CREATE_ACTIONS[mode!].PATH}>
            {CREATE_ACTIONS[mode!].LABEL}
          </Button>
        )}

        <TempFilters />

        <TableWithLoader
          loading={loading}
          loadingLabel="Stiamo caricando gli operatori"
          headData={headData}
          pagination={true}
          data={data}
          noDataLabel="Non ci sono operatori disponibili"
          error={error}
        >
          {data.map((item, i) => (
            <tr key={i}>
              <td>
                {item.name} {item.surname}
              </td>
              <td>{item.taxCode}</td>
              <td>{item.email}</td>
              <td>{USER_ROLE_LABEL[item.role]}</td>
              <td>{USER_PLATFORM_ROLE_LABEL[item.platformRole]}</td>
              <td>{USER_STATUS_LABEL[item.status]}</td>
              <td>
                {getAvailableActions(item).map((tableAction, j) => {
                  const btnProps: any = {}

                  if ((tableAction as TableActionLink).to) {
                    btnProps.as = Link
                    btnProps.to = (tableAction as TableActionLink).to
                  } else {
                    btnProps.onClick = (tableAction as TableActionBtn).onClick
                  }

                  return (
                    <TableAction
                      key={j}
                      btnProps={btnProps}
                      label={tableAction.label}
                      iconClass={tableAction.icon!}
                      isMock={tableAction.isMock}
                    />
                  )
                })}
              </td>
            </tr>
          ))}
        </TableWithLoader>
      </div>
    </WhiteBackground>
  )
}

export const UserList = compose(withUserFeedback, withToastOnMount)(UserListComponent)
