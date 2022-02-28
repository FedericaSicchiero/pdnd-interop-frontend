import React, { useContext, useEffect, useState } from 'react'
import { object, number } from 'yup'
import { Grid, Tab, Typography } from '@mui/material'
import { TabList, TabContext, TabPanel } from '@mui/lab'
import { useHistory, useLocation } from 'react-router-dom'
import { buildDynamicPath, getBits } from '../lib/router-utils'
import { useAsyncFetch } from '../hooks/useAsyncFetch'
import { mockPurpose1 } from '../temp/mock-purpose'
import {
  ActionProps,
  Client,
  DecoratedPurpose,
  DialogUpdatePurposeDailyCallsFormInputValues,
  Purpose,
} from '../../types'
import { DescriptionBlock } from '../components/DescriptionBlock'
import { decoratePurposeWithMostRecentVersion, getComputedPurposeState } from '../lib/purpose'
import { formatThousands } from '../lib/number-utils'
import { StyledLink } from '../components/Shared/StyledLink'
import { PURPOSE_STATE_LABEL } from '../config/labels'
import { StyledButton } from '../components/Shared/StyledButton'
import { useFeedback } from '../hooks/useFeedback'
import { downloadFile } from '../lib/file-utils'
import { AxiosResponse } from 'axios'
import { Box } from '@mui/system'
import { TableWithLoader } from '../components/Shared/TableWithLoader'
import { StyledTableRow } from '../components/Shared/StyledTableRow'
import { formatDateString } from '../lib/date-utils'
import { StyledIntro } from '../components/Shared/StyledIntro'
import { DialogContext } from '../lib/context'
import { DownloadList } from '../components/Shared/DownloadList'
import { useActiveTab } from '../hooks/useActiveTab'
import { ActionMenu } from '../components/Shared/ActionMenu'
import { useRoute } from '../hooks/useRoute'
// import { axiosErrorToError } from '../lib/error-utils'

export const PurposeView = () => {
  const history = useHistory()
  const [mockData, setMockData] = useState<DecoratedPurpose>()
  const location = useLocation()
  const { runAction, wrapActionInDialog } = useFeedback()
  const { setDialog } = useContext(DialogContext)
  const { routes } = useRoute()
  const { activeTab, updateActiveTab } = useActiveTab('details')
  const locationBits = getBits(location)
  const purposeId = locationBits[locationBits.length - 1]
  const { data /*, error */ } = useAsyncFetch<Purpose>(
    { path: { endpoint: 'PURPOSE_GET_SINGLE', endpointParams: { purposeId } } },
    { loadingTextLabel: 'Stiamo caricando la finalità richiesta' }
  )

  useEffect(() => {
    if (!data) {
      const decorated = decoratePurposeWithMostRecentVersion(mockPurpose1)
      setMockData(decorated)
    }
  }, [data])

  const downloadDocument = async () => {
    const { response, outcome } = await runAction(
      {
        path: {
          endpoint: 'PURPOSE_VERSION_RISK_ANALYSIS_DOWNLOAD',
          endpointParams: {
            purposeId,
            versionId: mockData?.currentVersion.id,
            documentId: mockData?.currentVersion.riskAnalysisDocument.id,
          },
        },
      },
      { suppressToast: true }
    )

    if (outcome === 'success') {
      downloadFile((response as AxiosResponse).data, 'document')
    }
  }

  const wrapRemoveFromPurpose = async (clientId: string) => {
    await runAction(
      {
        path: { endpoint: 'CLIENT_REMOVE_FROM_PURPOSE', endpointParams: { clientId } },
        config: { params: { purposeId } },
      },
      { suppressToast: true }
    )
  }

  const suspend = async () => {
    await runAction(
      {
        path: {
          endpoint: 'PURPOSE_VERSION_SUSPEND',
          endpointParams: { purposeId: mockData?.id, versionId: mockData?.currentVersion.id },
        },
      },
      { suppressToast: false }
    )
  }

  const archive = async () => {
    await runAction(
      {
        path: {
          endpoint: 'PURPOSE_VERSION_ARCHIVE',
          endpointParams: { purposeId: mockData?.id, versionId: mockData?.currentVersion.id },
        },
      },
      { suppressToast: false }
    )
  }

  const getClientAvailableActions = (item: Pick<Client, 'id' | 'name'>): Array<ActionProps> => {
    const removeFromPurposeAction = {
      onClick: wrapActionInDialog(wrapRemoveFromPurpose(item.id), 'CLIENT_REMOVE_FROM_PURPOSE'),
      label: 'Rimuovi dalla finalità',
    }

    return [removeFromPurposeAction]
  }

  const updateDailyCalls = () => {
    setDialog({
      type: 'updatePurposeDailyCalls',
      initialValues: { dailyCalls: 1 },
      validationSchema: object({ dailyCalls: number().required() }),
      onSubmit: async ({ dailyCalls }: DialogUpdatePurposeDailyCallsFormInputValues) => {
        await runAction(
          {
            path: {
              endpoint: 'PURPOSE_VERSION_DRAFT_CREATE',
              endpointParams: { purposeId: mockData?.id },
            },
            config: { params: { dailyCalls } },
          },
          { suppressToast: false }
        )
      },
    })
  }

  const headData = ['nome client']

  return (
    <React.Fragment>
      <StyledIntro>{{ title: mockData?.title }}</StyledIntro>

      <TabContext value={activeTab}>
        <TabList
          onChange={updateActiveTab}
          aria-label="Due tab diverse per i dettagli della finalità e i client associati"
          sx={{ my: 6 }}
          variant="fullWidth"
        >
          <Tab label="Dettagli finalità" value="details" />
          <Tab label="Client associati" value="clients" />
        </TabList>

        <TabPanel value="details">
          <Grid container columnSpacing={2}>
            <Grid item xs={8}>
              <DescriptionBlock label="Questa finalità può accedere all’e-service dell’erogatore?">
                <Typography component="span">
                  {mockData && getComputedPurposeState(mockData)}
                </Typography>
              </DescriptionBlock>

              <DescriptionBlock label="Stima di carico corrente">
                <Typography component="span">
                  {mockData && formatThousands(mockData?.currentVersion.dailyCalls)} chiamate/giorno
                </Typography>
              </DescriptionBlock>

              <DescriptionBlock label="Descrizione">
                <Typography component="span">{mockData?.description}</Typography>
              </DescriptionBlock>

              <DescriptionBlock label="La versione dell'e-service che stai usando">
                <StyledLink
                  to={buildDynamicPath(routes.SUBSCRIBE_CATALOG_VIEW.PATH, {
                    eserviceId: mockData?.eservice.id,
                    descriptorId: mockData?.eserviceDescriptor.id,
                  })}
                >
                  {mockData?.eservice.name}, versione {mockData?.eserviceDescriptor.version}
                </StyledLink>
              </DescriptionBlock>

              <DescriptionBlock label="Richiesta di fruizione">
                <StyledLink
                  to={buildDynamicPath(routes.SUBSCRIBE_AGREEMENT_EDIT.PATH, {
                    agreementId: mockData?.agreement.id,
                  })}
                >
                  Vedi richiesta
                </StyledLink>
              </DescriptionBlock>

              <DescriptionBlock label="Stato della finalità">
                <Typography component="span">
                  {mockData && PURPOSE_STATE_LABEL[mockData.currentVersion.state]}
                </Typography>
              </DescriptionBlock>

              {mockData && mockData.awaitingApproval && (
                <DescriptionBlock label="Richiesta di aggiornamento">
                  <Typography component="span">
                    Stima di carico: {formatThousands(mockData.mostRecentVersion.dailyCalls)}{' '}
                    chiamate/giorno
                  </Typography>
                  <br />
                  <Typography component="span">
                    {mockData.mostRecentVersion.expectedApprovalDate
                      ? `Data di approvazione stimata: ${formatDateString(
                          mockData.mostRecentVersion.expectedApprovalDate
                        )}`
                      : 'Non è stata determinata una data di approvazione'}
                  </Typography>
                </DescriptionBlock>
              )}

              {mockData && mockData.versions.length > 1 && (
                <DescriptionBlock label="Storico di questa finalità">
                  {mockData.versions.map((v, i) => {
                    const date = v.firstActivation || v.expectedApprovalDate
                    return (
                      <Typography component="span" key={i} sx={{ display: 'inline-block' }}>
                        {v.dailyCalls} chiamate/giorno; data di approvazione:{' '}
                        {date && formatDateString(date)}
                      </Typography>
                    )
                  })}
                </DescriptionBlock>
              )}
            </Grid>

            <Grid item xs={4} sx={{ mt: 5 }}>
              <DownloadList
                downloads={[
                  {
                    label: 'Analisi del rischio',
                    onClick: downloadDocument,
                  },
                ]}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex' }}>
            <StyledButton
              variant="contained"
              sx={{ mr: 2 }}
              onClick={wrapActionInDialog(suspend, 'PURPOSE_VERSION_SUSPEND')}
            >
              Sospendi
            </StyledButton>

            <StyledButton variant="outlined" sx={{ mr: 2 }} onClick={updateDailyCalls}>
              Aggiorna numero chiamate
            </StyledButton>

            <StyledButton
              variant="outlined"
              sx={{ mr: 2 }}
              onClick={wrapActionInDialog(archive, 'PURPOSE_VERSION_ARCHIVE')}
            >
              Archivia
            </StyledButton>

            <StyledButton variant="text" to={routes.SUBSCRIBE_PURPOSE_LIST.PATH}>
              Torna alla lista delle finalità
            </StyledButton>
          </Box>
        </TabPanel>

        <TabPanel value="clients">
          <Box sx={{ mt: 4 }}>
            <TableWithLoader
              loadingText=""
              headData={headData}
              noDataLabel="Non ci sono client disponibili"
              // error={axiosErrorToError(error)}
            >
              {mockData?.clients?.map((item, i) => (
                <StyledTableRow key={i} cellData={[{ label: item.name }]}>
                  <StyledButton
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      history.push(
                        buildDynamicPath(routes.SUBSCRIBE_CLIENT_EDIT.PATH, { clientId: item.id })
                      )
                    }}
                  >
                    Ispeziona
                  </StyledButton>

                  <ActionMenu actions={getClientAvailableActions(item)} />
                </StyledTableRow>
              ))}
            </TableWithLoader>
          </Box>
        </TabPanel>
      </TabContext>
    </React.Fragment>
  )
}