import { Box, Grid, Typography } from '@mui/material'
import { AxiosResponse } from 'axios'
import has from 'lodash/has'
import React, { FunctionComponent } from 'react'
import {
  AttributeKey,
  BackendAttribute,
  EServiceDescriptorRead,
  EServiceReadType,
  GroupBackendAttribute,
  SingleBackendAttribute,
} from '../../../types'
import { ATTRIBUTE_TYPE_PLURAL_LABEL, ESERVICE_STATE_LABEL } from '../../config/labels'
import { useFeedback } from '../../hooks/useFeedback'
import { useRoute } from '../../hooks/useRoute'
import { minutesToHoursMinutes } from '../../lib/date-utils'
import { downloadFile } from '../../lib/file-utils'
import { buildDynamicPath } from '../../lib/router-utils'
import { DescriptionBlock } from '../DescriptionBlock'
import { Contained } from './Contained'
import { DownloadList } from './DownloadList'
import { StyledAccordion } from './StyledAccordion'
import { StyledLink } from './StyledLink'

type EServiceContentInfoProps = {
  data: EServiceReadType
}

export const EServiceContentInfo: FunctionComponent<EServiceContentInfoProps> = ({ data }) => {
  const { runAction } = useFeedback()
  const { routes } = useRoute()
  const activeDescriptor = data.activeDescriptor as EServiceDescriptorRead

  const otherVersions = data.descriptors.filter((d) => d.id !== data.activeDescriptor?.id) || []

  // Get all documents actual URL
  const wrapDownloadDocument = (documentId: string) => async () => {
    const { response, outcome } = await runAction(
      {
        path: {
          endpoint: 'ESERVICE_VERSION_DOWNLOAD_DOCUMENT',
          endpointParams: {
            eserviceId: data.id,
            descriptorId: activeDescriptor.id,
            documentId,
          },
        },
      },
      { suppressToast: true }
    )

    if (outcome === 'success') {
      downloadFile((response as AxiosResponse).data, 'document')
    }
  }

  const toAccordionEntries = (attributes: Array<BackendAttribute>) => {
    return attributes.map((attribute) => {
      const isSingle = has(attribute, 'single')

      const labels = isSingle
        ? [(attribute as SingleBackendAttribute).single]
        : (attribute as GroupBackendAttribute).group

      let summary = ''
      let details: string | JSX.Element = ''
      if (labels.length === 1) {
        const { name, description, explicitAttributeVerification } = labels[0]
        summary = `${name} ${explicitAttributeVerification ? ' (verifica richiesta)' : ''}`
        details = description
      } else {
        summary = `${labels.map(({ name }) => name).join(' oppure ')}${
          labels[0].explicitAttributeVerification ? ' (verifica richiesta)' : ''
        }`
        details = (
          <React.Fragment>
            {labels.map((label, i) => {
              return (
                <Box sx={{ mb: i !== labels.length - 1 ? 2 : 0 }} key={i}>
                  <Typography component="span" sx={{ fontWeight: 700 }}>
                    {label.name}
                  </Typography>
                  : {label.description}
                </Box>
              )
            })}
          </React.Fragment>
        )
      }

      return { summary, details }
    })
  }

  const getFormattedVoucherLifespan = () => {
    const { hours, minutes } = minutesToHoursMinutes(activeDescriptor.voucherLifespan)
    if (hours === 0) {
      return `${minutes} minuti`
    }

    return `${hours} ore e ${minutes} minuti`
  }

  return (
    <Grid container columnSpacing={2}>
      <Grid item xs={8}>
        <DescriptionBlock label="Ente erogatore">
          <Typography component="span">{data.producer.name}</Typography>
        </DescriptionBlock>

        <DescriptionBlock label="Versione">
          <Typography component="span">{activeDescriptor.version}</Typography>
        </DescriptionBlock>

        <DescriptionBlock label="Stato della versione">
          <Typography component="span">{ESERVICE_STATE_LABEL[activeDescriptor.state]}</Typography>
        </DescriptionBlock>

        <DescriptionBlock label="Audience">
          <Typography component="span">{activeDescriptor.audience.join(', ')}</Typography>
        </DescriptionBlock>

        <DescriptionBlock label="Tecnologia">
          <Typography component="span">{data.technology}</Typography>
        </DescriptionBlock>

        <DescriptionBlock label="Durata del voucher">
          <Typography component="span">{getFormattedVoucherLifespan()}</Typography>
        </DescriptionBlock>

        <DescriptionBlock label="Soglia chiamate API/giorno">
          <Typography component="span">
            {activeDescriptor.dailyCallsMaxNumber} chiamate/giorno
          </Typography>
        </DescriptionBlock>

        {(Object.keys(data.attributes) as Array<AttributeKey>).map((key, i) => (
          <DescriptionBlock key={i} label={`Attributi ${ATTRIBUTE_TYPE_PLURAL_LABEL[key]}`}>
            <Contained>
              {data.attributes[key].length > 0 ? (
                <Box sx={{ mt: 1 }}>
                  <StyledAccordion entries={toAccordionEntries(data.attributes[key])} />
                </Box>
              ) : (
                <Typography component="span">Nessun attributo presente</Typography>
              )}
            </Contained>
          </DescriptionBlock>
        ))}

        {Boolean(otherVersions.length > 0) && (
          <DescriptionBlock label="Tutte le altre versioni di questo e-service">
            {otherVersions.map((d, i) => {
              return (
                <Box key={i}>
                  <StyledLink
                    to={buildDynamicPath(routes.PROVIDE_ESERVICE_MANAGE.PATH, {
                      eserviceId: data.id,
                      descriptorId: d.id,
                    })}
                  >
                    {data.name}, versione {d.version}
                  </StyledLink>
                </Box>
              )
            })}
          </DescriptionBlock>
        )}
      </Grid>
      <Grid item xs={4} sx={{ mt: 5 }}>
        <DownloadList
          downloads={[
            // TEMP PIN-1095 and PIN-1105
            // {
            //   label: 'Richiesta di fruizione',
            //   onClick: () => {
            //     console.log('download richiesta di fruizione')
            //   },
            // },
            {
              label: 'Documento di interfaccia',
              onClick: wrapDownloadDocument(activeDescriptor.interface.id),
            },
            ...activeDescriptor.docs.map((d) => ({
              label: d.description,
              onClick: wrapDownloadDocument(d.id),
            })),
          ]}
        />
      </Grid>
    </Grid>
  )
}
