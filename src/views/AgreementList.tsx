import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { WhiteBackground } from '../components/WhiteBackground'
import { AGREEMENT_STATUS, ROUTES } from '../lib/constants'
import { PartyContext } from '../lib/context'
import { AgreementStatus, AgreementSummary } from '../../types'
import { TableWithLoader } from '../components/TableWithLoader'
import { TableAction } from '../components/TableAction'
import { StyledIntro } from '../components/StyledIntro'
import { useAsyncFetch } from '../hooks/useAsyncFetch'
import { useMode } from '../hooks/useMode'

type Action = {
  to?: string
  onClick?: any
  icon: string
  label: string
}

export function AgreementList() {
  const mode = useMode()
  const { party } = useContext(PartyContext)

  const params =
    mode === 'provider' ? { producerId: party?.partyId } : { consumerId: party?.partyId }
  const { data: agreement, loading } = useAsyncFetch<AgreementSummary[]>(
    {
      path: { endpoint: 'AGREEMENT_GET_LIST' },
      config: { method: 'GET', params },
    },
    []
  )

  const getAvailableActions = (agreement: any) => {
    const availableActions: { [key in AgreementStatus]: any } = {
      active: [],
      suspended: [],
      pending: [],
    }

    const status = agreement.status

    // If status === 'draft', show precompiled write template. Else, readonly template
    const inspectAction = {
      to: `${
        ROUTES[mode === 'provider' ? 'PROVIDE' : 'SUBSCRIBE'].SUBROUTES!.AGREEMENT_LIST.PATH
      }/${agreement.id}`,
      icon: status === 'draft' ? 'bi-pencil' : 'bi-info-circle',
      label: status === 'draft' ? 'Modifica' : 'Ispeziona',
    }

    // Get all the actions available for this particular status
    const actions: Action[] = (availableActions as any)[status] || []

    // Add the last action, which is always EDIT/INSPECT
    actions.push(inspectAction)

    return actions
  }

  const headData = [
    'nome servizio',
    'versione servizio',
    'stato accordo',
    mode === 'provider' ? 'ente fruitore' : 'ente erogatore',
    '',
  ]

  return (
    <WhiteBackground>
      <StyledIntro>
        {{
          title: 'Gli accordi',
          description:
            "In quest'area puoi gestire tutti gli accordi stretti dai fruitori per i tuoi e-service",
        }}
      </StyledIntro>

      <div className="mt-4">
        <h1 className="py-3" style={{ color: 'red' }}>
          Aggiungere filtri
        </h1>

        <TableWithLoader
          isLoading={loading}
          loadingLabel="Stiamo caricando gli accordi"
          headData={headData}
          pagination={true}
        >
          {agreement?.length === 0 ? (
            <tr>
              <td colSpan={headData.length}>Non ci sono accordi disponibili</td>
            </tr>
          ) : (
            agreement?.map((item, i) => (
              <tr key={i}>
                <td>{item.eserviceName || item.eserviceId}</td>
                <td>{item.eserviceVersion || 1}</td>
                <td>{AGREEMENT_STATUS[item.status]}</td>
                <td>
                  {mode === 'provider'
                    ? item.consumerName || item.consumerId
                    : item.producerName || item.producerId}
                </td>
                <td>
                  {getAvailableActions(item).map(({ to, onClick, icon, label }, j) => {
                    const btnProps: any = { onClick }

                    if (to) {
                      btnProps.as = Link
                      btnProps.to = to
                      delete btnProps.onClick // Redundant, here just for clarity
                    }

                    return (
                      <TableAction key={j} btnProps={btnProps} label={label} iconClass={icon} />
                    )
                  })}
                </td>
              </tr>
            ))
          )}
        </TableWithLoader>
      </div>
    </WhiteBackground>
  )
}