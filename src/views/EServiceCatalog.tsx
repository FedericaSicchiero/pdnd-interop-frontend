import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { EServiceReadType } from '../../types'
import { StyledIntro } from '../components/StyledIntro'
import { TableAction } from '../components/TableAction'
import { TableWithLoader } from '../components/TableWithLoader'
import { WhiteBackground } from '../components/WhiteBackground'
import { useAsyncFetch } from '../hooks/useAsyncFetch'
import { fetchWithLogs } from '../lib/api-utils'
import { ESERVICE_STATUS_LABEL, ROUTES } from '../lib/constants'
import { PartyContext } from '../lib/context'

export function EServiceCatalog() {
  const { party } = useContext(PartyContext)
  const { data, loading, error } = useAsyncFetch<EServiceReadType[]>(
    {
      path: { endpoint: 'ESERVICE_GET_LIST' },
      config: { method: 'GET', params: { status: 'published' } },
    },
    { defaultValue: [] }
  )

  const buildSubscribe = (service: any) => async (_: any) => {
    const flattenedVerifiedAttributes = service.attributes.verified.reduce(
      (acc: any, next: any) => {
        const nextIds = next.simple ? [next.simple] : next.group
        return [...acc, ...nextIds]
      },
      []
    )

    const agreementData = {
      eserviceId: service.id,
      producerId: service.producerId,
      consumerId: party?.partyId,
      verifiedAttributes: flattenedVerifiedAttributes.map((id: string) => ({
        id,
        verified: false,
        validityTimespan: 100000000,
      })),
    }

    await fetchWithLogs({ endpoint: 'AGREEMENT_CREATE' }, { method: 'POST', data: agreementData })
  }

  const headData = ['nome servizio', 'versione attuale', 'stato del servizio', '']

  return (
    <WhiteBackground>
      <StyledIntro>
        {{
          title: 'Gli e-service disponibili',
          description:
            "In quest'area puoi vedere tutti gli e-service nel catalogo, e iscriverti a quelli a cui sei interessato",
        }}
      </StyledIntro>

      <h1 className="py-3" style={{ color: 'red' }}>
        Aggiungere filtri
      </h1>

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
            <td>{item.name}</td>
            <td>{item.descriptors[0].version}</td>
            <td>{ESERVICE_STATUS_LABEL[item.descriptors[0].status]}</td>
            <td>
              <TableAction
                btnProps={{ onClick: buildSubscribe(item) }}
                label="Iscriviti"
                iconClass={'bi-pencil-square'}
              />
              <TableAction
                btnProps={{
                  as: Link,
                  to: `${ROUTES.SUBSCRIBE.SUBROUTES!.CATALOG_VIEW.PATH}/${item.id}`,
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
