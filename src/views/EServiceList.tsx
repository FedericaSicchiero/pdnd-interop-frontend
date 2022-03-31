import React, { useContext } from 'react'
import { useHistory } from 'react-router'
import { LangContext, PartyContext } from '../lib/context'
import {
  ApiEndpointKey,
  EServiceDescriptorRead,
  EServiceFlatReadType,
  EServiceState,
  ActionProps,
  MappedRouteConfig,
} from '../../types'
import { TableWithLoader } from '../components/Shared/TableWithLoader'
import { StyledIntro } from '../components/Shared/StyledIntro'
import { useAsyncFetch } from '../hooks/useAsyncFetch'
import { useFeedback } from '../hooks/useFeedback'
import { TempFilters } from '../components/TempFilters'
import { AxiosResponse } from 'axios'
import { buildDynamicPath } from '../lib/router-utils'
import { StyledButton } from '../components/Shared/StyledButton'
import { ESERVICE_STATE_LABEL } from '../config/labels'
import { StyledTableRow } from '../components/Shared/StyledTableRow'
import { ActionMenu } from '../components/Shared/ActionMenu'
import { axiosErrorToError } from '../lib/error-utils'
import { URL_FRAGMENTS } from '../lib/constants'
import { useRoute } from '../hooks/useRoute'
import { RunActionOutput } from '../hooks/useFeedback'
import { PageTopFilters } from '../components/Shared/PageTopFilters'
import { Box } from '@mui/material'

type AsyncTableProps = {
  forceRerenderCounter: number
  getActions: (service: EServiceFlatReadType) => Array<ActionProps>
  headData: Array<string>
  routes: Record<string, MappedRouteConfig>
}

const AsyncTable = ({ forceRerenderCounter, getActions, headData, routes }: AsyncTableProps) => {
  const { party } = useContext(PartyContext)
  const { lang } = useContext(LangContext)
  const history = useHistory()

  const { data, loadingText, error } = useAsyncFetch<Array<EServiceFlatReadType>>(
    {
      path: { endpoint: 'ESERVICE_GET_LIST_FLAT' },
      config: {
        params: { producerId: party?.id, callerId: party?.id },
      },
    },
    {
      useEffectDeps: [forceRerenderCounter],
      loaderType: 'contextual',
      loadingTextLabel: 'Stiamo caricando i tuoi E-Service',
    }
  )

  return (
    <TableWithLoader
      loadingText={loadingText}
      headData={headData}
      noDataLabel="Non ci sono servizi disponibili"
      error={axiosErrorToError(error)}
    >
      {data &&
        Boolean(data.length > 0) &&
        data.map((item, i) => (
          <StyledTableRow
            key={i}
            cellData={[
              { label: item.name },
              { label: item.version || '1' },
              { label: ESERVICE_STATE_LABEL[item.state || 'DRAFT'] },
            ]}
          >
            <StyledButton
              variant="outlined"
              size="small"
              onClick={() => {
                const destPath =
                  !item.state || item.state === 'DRAFT'
                    ? routes.PROVIDE_ESERVICE_EDIT.PATH
                    : routes.PROVIDE_ESERVICE_MANAGE.PATH

                history.push(
                  buildDynamicPath(destPath, {
                    eserviceId: item.id,
                    descriptorId: item.descriptorId || URL_FRAGMENTS.FIRST_DRAFT[lang],
                  })
                )
              }}
            >
              {!item.state || item.state === 'DRAFT' ? 'Modifica' : 'Ispeziona'}
            </StyledButton>

            <Box component="span" sx={{ ml: 2, display: 'inline-block' }}>
              <ActionMenu actions={getActions(item)} />
            </Box>
          </StyledTableRow>
        ))}
    </TableWithLoader>
  )
}

export function EServiceList() {
  const { runAction, forceRerenderCounter } = useFeedback()
  const history = useHistory()
  const { routes } = useRoute()

  /*
   * List of possible actions for the user to perform
   */
  const wrapPublishDraft = (eserviceId: string, descriptorId?: string) => async () => {
    await runAction(
      {
        path: {
          endpoint: 'ESERVICE_VERSION_DRAFT_PUBLISH',
          endpointParams: { eserviceId, descriptorId },
        },
      },
      { showConfirmDialog: true }
    )
  }

  const wrapDeleteDraft = (eserviceId: string, descriptorId?: string) => async () => {
    let endpoint: ApiEndpointKey = 'ESERVICE_DRAFT_DELETE'
    const endpointParams: Record<string, string> = { eserviceId }

    if (descriptorId) {
      endpoint = 'ESERVICE_VERSION_DRAFT_DELETE'
      endpointParams.descriptorId = descriptorId
    }

    await runAction({ path: { endpoint, endpointParams } }, { showConfirmDialog: true })
  }

  const wrapSuspend = (eserviceId: string, descriptorId?: string) => async () => {
    await runAction(
      {
        path: {
          endpoint: 'ESERVICE_VERSION_SUSPEND',
          endpointParams: { eserviceId, descriptorId },
        },
      },
      { showConfirmDialog: true }
    )
  }

  const wrapReactivate = (eserviceId: string, descriptorId?: string) => async () => {
    await runAction(
      {
        path: {
          endpoint: 'ESERVICE_VERSION_REACTIVATE',
          endpointParams: { eserviceId, descriptorId },
        },
      },
      { showConfirmDialog: true }
    )
  }

  // const archive = () => {
  //   //
  // }

  // Clones the properties and generates a new service
  const wrapClone = (eserviceId: string, descriptorId?: string) => async () => {
    await runAction(
      {
        path: {
          endpoint: 'ESERVICE_CLONE_FROM_VERSION',
          endpointParams: { eserviceId, descriptorId },
        },
      },
      { showConfirmDialog: true }
    )
  }

  // Clones all the properties of the previous version and generates a new draft version
  const wrapCreateNewVersionDraft = (eserviceId: string) => async () => {
    const { outcome, response } = (await runAction(
      {
        path: { endpoint: 'ESERVICE_VERSION_DRAFT_CREATE', endpointParams: { eserviceId } },
        config: {
          data: {
            voucherLifespan: 1,
            audience: [],
            description: '',
            dailyCallsPerConsumer: 1,
            dailyCallsTotal: 1,
          },
        },
      },
      { suppressToast: ['success'], showConfirmDialog: true }
    )) as RunActionOutput

    if (outcome === 'success') {
      const successResponse = response as AxiosResponse<EServiceDescriptorRead>
      const descriptorId = successResponse.data.id
      history.push(
        buildDynamicPath(routes.PROVIDE_ESERVICE_EDIT.PATH, {
          eserviceId,
          descriptorId,
        }),
        { stepIndexDestination: 1 }
      )
    }
  }
  /*
   * End list of actions
   */

  type EServiceAction = Record<EServiceState, Array<ActionProps | null>>
  // Build list of available actions for each service in its current state
  const getAvailableActions = (service: EServiceFlatReadType) => {
    const { id: eserviceId, descriptorId, state } = service

    const suspendAction = { onClick: wrapSuspend(eserviceId, descriptorId), label: 'Sospendi' }
    const reactivateAction = {
      onClick: wrapReactivate(eserviceId, descriptorId),
      label: 'Riattiva',
    }
    const cloneAction = { onClick: wrapClone(eserviceId, descriptorId), label: 'Clona' }
    const createVersionDraftAction = {
      onClick: wrapCreateNewVersionDraft(eserviceId),
      label: 'Crea bozza nuova versione',
    }
    // TEMP PIN-645
    // const archiveAction = { onClick: archive, label: 'Archivia' }
    const publishDraftAction = {
      onClick: wrapPublishDraft(eserviceId, descriptorId),
      label: 'Pubblica',
    }
    const deleteDraftAction = {
      onClick: wrapDeleteDraft(eserviceId, descriptorId),
      label: 'Elimina',
    }

    const availableActions: EServiceAction = {
      PUBLISHED: [suspendAction, cloneAction, createVersionDraftAction],
      ARCHIVED: [],
      DEPRECATED: [suspendAction /*, archiveAction */],
      DRAFT: [descriptorId ? publishDraftAction : null, deleteDraftAction],
      SUSPENDED: [reactivateAction, cloneAction, createVersionDraftAction],
    }

    // Return all the actions available for this particular status
    return availableActions[state || 'DRAFT'].filter((a) => a !== null) as Array<ActionProps>
  }

  // Data for the table head
  const headData = ['Nome E-Service', 'Versione', 'Stato E-Service', '']

  return (
    <React.Fragment>
      <StyledIntro>
        {{
          title: 'I tuoi E-Service',
          description: "In quest'area puoi gestire tutti gli E-Service che stai erogando",
        }}
      </StyledIntro>

      <PageTopFilters>
        <TempFilters />
        <StyledButton variant="contained" size="small" to={routes.PROVIDE_ESERVICE_CREATE.PATH}>
          + Aggiungi
        </StyledButton>
      </PageTopFilters>

      <AsyncTable
        forceRerenderCounter={forceRerenderCounter}
        getActions={getAvailableActions}
        headData={headData}
        routes={routes}
      />
    </React.Fragment>
  )
}
