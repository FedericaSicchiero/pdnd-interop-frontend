import React, { useContext } from 'react'
import { object, number } from 'yup'
import { Tab, Typography } from '@mui/material'
import { TabList, TabContext, TabPanel } from '@mui/lab'
import { useHistory, useLocation } from 'react-router-dom'
import { buildDynamicPath } from '../lib/router-utils'
import { useAsyncFetch } from '../hooks/useAsyncFetch'
import {
  ActionProps,
  Client,
  DecoratedPurpose,
  DialogUpdatePurposeDailyCallsFormInputValues,
  Purpose,
  PurposeState,
} from '../../types'
import { DescriptionBlock } from '../components/DescriptionBlock'
import {
  decoratePurposeWithMostRecentVersion,
  getComputedPurposeState,
  getPurposeFromUrl,
} from '../lib/purpose'
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
  const location = useLocation()
  const { runAction, wrapActionInDialog, forceRerenderCounter } = useFeedback()
  const { setDialog } = useContext(DialogContext)
  const { routes } = useRoute()
  const { activeTab, updateActiveTab } = useActiveTab('details')
  const purposeId = getPurposeFromUrl(location)
  const { data /*, error */ } = useAsyncFetch<Purpose, DecoratedPurpose>(
    { path: { endpoint: 'PURPOSE_GET_SINGLE', endpointParams: { purposeId } } },
    {
      loadingTextLabel: 'Stiamo caricando la finalità richiesta',
      mapFn: decoratePurposeWithMostRecentVersion,
      useEffectDeps: [forceRerenderCounter],
    }
  )

  const downloadDocument = async () => {
    const { response, outcome } = await runAction(
      {
        path: {
          endpoint: 'PURPOSE_VERSION_RISK_ANALYSIS_DOWNLOAD',
          endpointParams: {
            purposeId,
            versionId: data?.currentVersion.id,
            documentId: data?.currentVersion.riskAnalysisDocument.id,
          },
        },
      },
      { suppressToast: true }
    )

    if (outcome === 'success') {
      downloadFile((response as AxiosResponse).data, 'document')
    }
  }

  /*
   * List of possible actions to perform in the purpose tab
   */
  const activate = async () => {
    await runAction(
      {
        path: {
          endpoint: 'PURPOSE_VERSION_ACTIVATE',
          endpointParams: { purposeId: data?.id, versionId: data?.currentVersion.id },
        },
      },
      { suppressToast: false }
    )
  }

  const suspend = async () => {
    await runAction(
      {
        path: {
          endpoint: 'PURPOSE_VERSION_SUSPEND',
          endpointParams: { purposeId: data?.id, versionId: data?.currentVersion.id },
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
          endpointParams: { purposeId: data?.id, versionId: data?.currentVersion.id },
        },
      },
      { suppressToast: false }
    )
  }

  const deletePurpose = async () => {
    await runAction(
      {
        path: { endpoint: 'PURPOSE_DRAFT_DELETE', endpointParams: { purposeId: data?.id } },
      },
      { suppressToast: false }
    )
  }

  const deleteVersionPurpose = async () => {
    await runAction(
      {
        path: {
          endpoint: 'PURPOSE_VERSION_DELETE',
          endpointParams: { purposeId: data?.id, versionId: data?.mostRecentVersion.id },
        },
      },
      { suppressToast: false }
    )
  }
  /*
   * End list of actions
   */

  // Build list of available actions for this purpose
  const getPurposeAvailableActions = () => {
    if (!data) {
      return []
    }

    const archiveAction = {
      onClick: wrapActionInDialog(archive, 'PURPOSE_VERSION_ARCHIVE'),
      label: 'Archivia',
    }

    const suspendAction = {
      onClick: wrapActionInDialog(suspend, 'PURPOSE_VERSION_SUSPEND'),
      label: 'Sospendi',
    }

    const activateAction = {
      onClick: wrapActionInDialog(activate, 'PURPOSE_VERSION_ACTIVATE'),
      label: 'Attiva',
    }

    const deleteAction = {
      onClick: wrapActionInDialog(deletePurpose, 'PURPOSE_DRAFT_DELETE'),
      label: 'Elimina',
    }

    const deleteVersionAction = {
      onClick: wrapActionInDialog(deleteVersionPurpose, 'PURPOSE_VERSION_DELETE'),
      label: 'Elimina aggiornamento numero chiamate',
    }

    const updateDailyCallsAction = {
      onClick: updateDailyCalls,
      label: 'Aggiorna numero chiamate',
    }

    const availableActions: Record<PurposeState, Array<ActionProps>> = {
      DRAFT: [], // If in draft, it will go to the PurposeCreate component
      ACTIVE: [suspendAction, updateDailyCallsAction],
      SUSPENDED: [activateAction, archiveAction],
      WAITING_FOR_APPROVAL: [data?.versions.length > 1 ? deleteVersionAction : deleteAction],
      ARCHIVED: [],
    }

    const status = data.mostRecentVersion.state

    // Return all the actions available for this particular status
    return availableActions[status] || []
  }

  /*
   * List of possible actions to perform in the client tab
   */
  const wrapRemoveFromPurpose = (clientId: string) => async () => {
    await runAction(
      {
        path: { endpoint: 'CLIENT_REMOVE_FROM_PURPOSE', endpointParams: { clientId, purposeId } },
      },
      { suppressToast: false }
    )
  }
  /*
   * End list of actions
   */

  // Build list of available actions for each client in its current state
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
        const { outcome, response } = await runAction(
          {
            path: {
              endpoint: 'PURPOSE_VERSION_DRAFT_CREATE',
              endpointParams: { purposeId: data?.id },
            },
            config: { data: { dailyCalls } },
          },
          { suppressToast: true, silent: true }
        )

        if (outcome === 'success') {
          const versionId = (response as AxiosResponse).data.id
          await runAction(
            {
              path: {
                endpoint: 'PURPOSE_VERSION_ACTIVATE',
                endpointParams: { purposeId, versionId },
              },
            },
            { suppressToast: false }
          )
        }
      },
    })
  }

  const addClients = async (newClientsData: Array<Client>) => {
    const alreadyPostedClients = (data?.clients || []).map((c) => c.id)
    const newClients = newClientsData.filter((c) => !alreadyPostedClients.includes(c.id))

    // TEMP REFACTOR: improve this with error messages, failure handling, etc
    await Promise.all(
      newClients.map(async ({ id: clientId }) => {
        return await runAction(
          {
            path: { endpoint: 'CLIENT_JOIN_WITH_PURPOSE', endpointParams: { clientId } },
            config: { data: { purposeId } },
          },
          { suppressToast: false }
        )
      })
    )
  }

  const showClientsDialog = () => {
    setDialog({ type: 'addClients', exclude: data?.clients || [], onSubmit: addClients })
  }

  const headData = ['Nome client']

  return (
    <React.Fragment>
      <StyledIntro>{{ title: data?.title, description: data?.description }}</StyledIntro>

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
          <DescriptionBlock label="Accesso consentito?">
            <Typography component="span">{data && getComputedPurposeState(data)}</Typography>
          </DescriptionBlock>

          <DescriptionBlock label="Stima di carico corrente">
            <Typography component="span">
              {data && formatThousands(data?.currentVersion.dailyCalls)} chiamate/giorno
            </Typography>
          </DescriptionBlock>

          {data && data.awaitingApproval && (
            <DescriptionBlock label="Richiesta di aggiornamento">
              <Typography component="span">
                Stima di carico: {formatThousands(data.mostRecentVersion.dailyCalls)}{' '}
                chiamate/giorno
              </Typography>
              <br />
              <Typography component="span">
                {data.mostRecentVersion.expectedApprovalDate
                  ? `Data di completamento stimata: ${formatDateString(
                      data.mostRecentVersion.expectedApprovalDate
                    )}`
                  : 'Non è stata determinata una data di completamento'}
              </Typography>
            </DescriptionBlock>
          )}

          <DescriptionBlock label="La versione dell'E-Service che stai usando">
            <StyledLink
              to={buildDynamicPath(routes.SUBSCRIBE_CATALOG_VIEW.PATH, {
                eserviceId: data?.eservice.id,
                descriptorId: data?.eservice.descriptor.id,
              })}
            >
              {data?.eservice.name}, versione {data?.eservice.descriptor.version}
            </StyledLink>
          </DescriptionBlock>

          <DescriptionBlock label="Richiesta di fruizione">
            <StyledLink
              to={buildDynamicPath(routes.SUBSCRIBE_AGREEMENT_EDIT.PATH, {
                agreementId: data?.agreement.id,
              })}
            >
              Vedi richiesta
            </StyledLink>
          </DescriptionBlock>

          <DescriptionBlock label="Stato della finalità">
            <Typography component="span">
              {data && PURPOSE_STATE_LABEL[data.currentVersion.state]}
            </Typography>
          </DescriptionBlock>

          <DescriptionBlock label="Download">
            <DownloadList
              downloads={[
                {
                  label: 'Analisi del rischio',
                  onClick: downloadDocument,
                },
              ]}
            />
          </DescriptionBlock>

          {data && data.versions.length > 1 && (
            <DescriptionBlock label="Storico di questa finalità">
              {data.versions.map((v, i) => {
                const date = v.firstActivationAt || v.expectedApprovalDate
                return (
                  <Typography component="span" key={i} sx={{ display: 'inline-block' }}>
                    {formatThousands(v.dailyCalls)} chiamate/giorno; data di approvazione:{' '}
                    {date ? formatDateString(date) : 'n/d'}
                  </Typography>
                )
              })}
            </DescriptionBlock>
          )}

          <Box sx={{ mt: 4, display: 'flex' }}>
            {getPurposeAvailableActions().map(({ onClick, label }, i) => (
              <StyledButton
                sx={{ mr: 2 }}
                variant={i === 0 ? 'contained' : 'outlined'}
                key={i}
                onClick={onClick}
              >
                {label}
              </StyledButton>
            ))}

            <StyledButton variant="outlined" to={routes.SUBSCRIBE_PURPOSE_LIST.PATH}>
              Torna alla lista delle finalità
            </StyledButton>
          </Box>
        </TabPanel>

        <TabPanel value="clients">
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
              <StyledButton variant="contained" onClick={showClientsDialog}>
                + Aggiungi
              </StyledButton>
            </Box>

            <TableWithLoader
              loadingText=""
              headData={headData}
              noDataLabel="Non ci sono client associati a questa finalità"
              // error={axiosErrorToError(error)}
            >
              {data?.clients?.map((item, i) => (
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
