import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { EServiceFlatReadType } from '../../types'
import { StyledIntro } from '../components/StyledIntro'
import { ActionWithTooltip } from '../components/ActionWithTooltip'
import { TableWithLoader } from '../components/TableWithLoader'
import { WhiteBackground } from '../components/WhiteBackground'
import { UserFeedbackHOCProps, withUserFeedback } from '../components/withUserFeedback'
import { useAsyncFetch } from '../hooks/useAsyncFetch'
import { ESERVICE_STATUS_LABEL, ROUTES } from '../lib/constants'
import { PartyContext, UserContext } from '../lib/context'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { TempFilters } from '../components/TempFilters'
import { isAdmin } from '../lib/auth-utils'

type ExtendedEServiceFlatReadType = EServiceFlatReadType & {
  isMine: boolean
  amISubscribed: boolean
}

export function EServiceCatalogComponent({ runAction, wrapActionInDialog }: UserFeedbackHOCProps) {
  const { party } = useContext(PartyContext)
  const { user } = useContext(UserContext)
  const { data, loading, error } = useAsyncFetch<
    EServiceFlatReadType[],
    ExtendedEServiceFlatReadType[]
  >(
    {
      path: { endpoint: 'ESERVICE_GET_LIST_FLAT' },
      config: { method: 'GET', params: { status: 'published' } },
    },
    {
      defaultValue: [],
      mapFn: (data) =>
        data.map((d) => ({ ...d, isMine: d.producerId === party?.partyId, amISubscribed: false })),
    }
  )

  /*
   * List of possible actions for the user to perform
   */
  const wrapSubscribe = (service: EServiceFlatReadType) => async (_: any) => {
    const agreementData = {
      eserviceId: service.id,
      descriptorId: service.descriptorId,
      consumerId: party?.partyId,
    }

    await runAction(
      { path: { endpoint: 'AGREEMENT_CREATE' }, config: { method: 'POST', data: agreementData } },
      { suppressToast: false }
    )
  }
  /*
   * End list of actions
   */

  const headData = ['nome servizio', 'versione attuale', 'stato del servizio', '']

  const InfoTooltip = ({ label = '', iconClass = '' }) => (
    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">{label}</Tooltip>}>
      <i className={`text-primary ms-2 fs-5 bi ${iconClass}`} />
    </OverlayTrigger>
  )

  return (
    <WhiteBackground>
      <StyledIntro priority={2}>
        {{
          title: 'Gli e-service disponibili',
          description:
            "In quest'area puoi vedere tutti gli e-service nel catalogo, e aderire a quelli a cui sei interessato",
        }}
      </StyledIntro>

      <TempFilters />

      <TableWithLoader
        loading={loading}
        loadingLabel="Stiamo caricando la lista degli e-service"
        headData={headData}
        pagination={true}
        data={data}
        noDataLabel="Non ci sono servizi disponibili"
        error={error}
      >
        {data.map((item, i) => (
          <tr key={i}>
            <td>
              {item.name}
              {item.isMine && <InfoTooltip label="Sei l'erogatore" iconClass="bi-key-fill" />}
            </td>
            <td>{item.version}</td>
            <td>{ESERVICE_STATUS_LABEL[item.status!]}</td>
            <td>
              {!item.isMine && isAdmin(user) && (
                <ActionWithTooltip
                  btnProps={{
                    onClick: wrapActionInDialog(wrapSubscribe(item), 'AGREEMENT_CREATE'),
                  }}
                  label="Iscriviti"
                  iconClass={'bi-pencil-square'}
                />
              )}
              <ActionWithTooltip
                btnProps={{
                  as: Link,
                  to: `${ROUTES.SUBSCRIBE.SUBROUTES!.CATALOG_VIEW.PATH}/${item.id}/${
                    item.descriptorId
                  }`,
                }}
                label="Ispeziona"
                iconClass={'bi-info-circle'}
              />
            </td>
          </tr>
        ))}
      </TableWithLoader>
    </WhiteBackground>
  )
}

export const EServiceCatalog = withUserFeedback(EServiceCatalogComponent)
