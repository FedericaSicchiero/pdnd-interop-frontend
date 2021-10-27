import React, { useContext } from 'react'
import { useHistory } from 'react-router'
import { ESERVICE_STATUS_LABEL, ROUTES } from '../lib/constants'
import { PartyContext } from '../lib/context'
import {
  ApiEndpointKey,
  EServiceDescriptorRead,
  EServiceFlatReadType,
  EServiceStatus,
  ActionProps,
} from '../../types'
import { TableWithLoader } from '../components/Shared/TableWithLoader'
import { Action } from '../components/Shared/Action'
import { StyledIntro } from '../components/Shared/StyledIntro'
import { useAsyncFetch } from '../hooks/useAsyncFetch'
import { useFeedback } from '../hooks/useFeedback'
import { TempFilters } from '../components/TempFilters'
import { AxiosResponse } from 'axios'
import { buildDynamicPath } from '../lib/url-utils'
import { StyledButton } from '../components/Shared/StyledButton'
import { StyledLink } from '../components/Shared/StyledLink'

export function EServiceList() {
  const { runAction, runFakeAction, forceRerenderCounter, wrapActionInDialog } = useFeedback()
  const history = useHistory()
  const { party } = useContext(PartyContext)
  const { data, loadingText, error } = useAsyncFetch<EServiceFlatReadType[]>(
    {
      path: { endpoint: 'ESERVICE_GET_LIST_FLAT' },
      config: {
        params: { producerId: party?.partyId, callerId: party?.partyId },
      },
    },
    {
      defaultValue: [],
      useEffectDeps: [forceRerenderCounter],
      loaderType: 'contextual',
      loadingTextLabel: 'Stiamo caricando i tuoi e-service',
    }
  )

  /*
   * List of possible actions for the user to perform
   */
  const wrapPublishDraft = (eserviceId: string, descriptorId?: string) => async (_: any) => {
    await runAction(
      {
        path: {
          endpoint: 'ESERVICE_VERSION_PUBLISH',
          endpointParams: { eserviceId, descriptorId },
        },
      },
      { suppressToast: false }
    )
  }

  const wrapDeleteDraft = (eserviceId: string, descriptorId?: string) => async (_: any) => {
    let endpoint: ApiEndpointKey = 'ESERVICE_DELETE'
    let endpointParams: any = { eserviceId }

    if (descriptorId) {
      endpoint = 'ESERVICE_VERSION_DELETE'
      endpointParams.descriptorId = descriptorId
    }

    await runAction({ path: { endpoint, endpointParams } }, { suppressToast: false })
  }

  const wrapSuspend = (eserviceId: string, descriptorId?: string) => async (_: any) => {
    await runAction(
      {
        path: {
          endpoint: 'ESERVICE_VERSION_SUSPEND',
          endpointParams: { eserviceId, descriptorId },
        },
      },
      { suppressToast: false }
    )
  }

  const wrapReactivate = (eserviceId: string, descriptorId?: string) => async (_: any) => {
    await runAction(
      {
        path: {
          endpoint: 'ESERVICE_VERSION_REACTIVATE',
          endpointParams: { eserviceId, descriptorId },
        },
      },
      { suppressToast: false }
    )
  }

  const archive = () => {
    // Can only archive if all agreements on that version are archived
    // Check with backend if this can be automated
    runFakeAction('Archivia e-service')
  }

  // Clones the properties and generates a new service
  const wrapClone = (eserviceId: string, descriptorId?: string) => async (_: any) => {
    await runAction(
      {
        path: {
          endpoint: 'ESERVICE_CLONE_FROM_VERSION',
          endpointParams: { eserviceId, descriptorId },
        },
      },
      { suppressToast: false }
    )
  }

  // Clones all the properties of the previous version and generates a new draft version
  const wrapCreateNewVersionDraft = (eserviceId: string) => async () => {
    const { outcome, response } = await runAction(
      {
        path: { endpoint: 'ESERVICE_VERSION_CREATE', endpointParams: { eserviceId } },
        config: { data: { voucherLifespan: 0, audience: [], description: '' } },
      },
      { suppressToast: true }
    )

    if (outcome === 'success') {
      const successResponse = response as AxiosResponse<EServiceDescriptorRead>
      const descriptorId = successResponse.data.id
      history.push(
        buildDynamicPath(ROUTES.PROVIDE.SUBROUTES!.ESERVICE_EDIT.PATH, {
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

  type EServiceAction = { [key in EServiceStatus]: Array<ActionProps | null> }
  // Build list of available actions for each service in its current state
  const getAvailableActions = (service: EServiceFlatReadType) => {
    const { id: eserviceId, descriptorId, status } = service

    const suspendAction = {
      btnProps: {
        onClick: wrapActionInDialog(
          wrapSuspend(eserviceId, descriptorId),
          'ESERVICE_VERSION_SUSPEND'
        ),
      },
      label: 'Sospendi',
    }
    const reactivateAction = {
      btnProps: {
        onClick: wrapActionInDialog(
          wrapReactivate(eserviceId, descriptorId),
          'ESERVICE_VERSION_REACTIVATE'
        ),
      },
      label: 'Riattiva',
    }
    const cloneAction = {
      btnProps: {
        onClick: wrapActionInDialog(
          wrapClone(eserviceId, descriptorId),
          'ESERVICE_CLONE_FROM_VERSION'
        ),
      },
      label: 'Clona',
    }
    const createVersionDraftAction = {
      btnProps: {
        onClick: wrapActionInDialog(
          wrapCreateNewVersionDraft(eserviceId),
          'ESERVICE_VERSION_CREATE'
        ),
      },
      label: 'Crea bozza nuova versione',
    }
    const archiveAction = {
      btnProps: { onClick: wrapActionInDialog(archive) },
      label: 'Archivia',
      isMock: true,
    }
    const publishDraftAction = {
      btnProps: {
        onClick: wrapActionInDialog(
          wrapPublishDraft(eserviceId, descriptorId),
          'ESERVICE_VERSION_PUBLISH'
        ),
      },
      label: 'Pubblica',
    }
    const deleteDraftAction = {
      btnProps: {
        onClick: wrapActionInDialog(
          wrapDeleteDraft(eserviceId, descriptorId),
          'ESERVICE_VERSION_DELETE'
        ),
      },
      label: 'Elimina',
    }

    const availableActions: EServiceAction = {
      published: [suspendAction, cloneAction, createVersionDraftAction],
      archived: [],
      deprecated: [suspendAction, archiveAction],
      draft: [descriptorId ? publishDraftAction : null, deleteDraftAction],
      suspended: [reactivateAction, cloneAction, createVersionDraftAction],
    }

    // If status === 'draft', show precompiled write template. Else, readonly template
    const inspectAction = {
      btnProps: {
        to: buildDynamicPath(ROUTES.PROVIDE.SUBROUTES!.ESERVICE_EDIT.PATH, {
          eserviceId,
          descriptorId: descriptorId || 'prima-bozza',
        }),
        component: StyledLink,
      },
      label: !status || status === 'draft' ? 'Modifica' : 'Ispeziona',
    }

    // Get all the actions available for this particular status
    const actions = availableActions[status || 'draft'].filter((a) => a !== null) as ActionProps[]

    // Add the last action, which is always EDIT/INSPECT
    actions.push(inspectAction)

    return actions
  }

  // Data for the table head
  const headData = ['nome e-service', 'versione', 'stato e-service', '']

  return (
    <React.Fragment>
      <StyledIntro>
        {{
          title: 'I tuoi e-service',
          description: "In quest'area puoi gestire tutti gli e-service che stai erogando",
        }}
      </StyledIntro>

      <div className="mt-4">
        <StyledButton
          variant="contained"
          component={StyledLink}
          to={ROUTES.PROVIDE.SUBROUTES!.ESERVICE_CREATE.PATH}
        >
          {ROUTES.PROVIDE.SUBROUTES!.ESERVICE_CREATE.LABEL}
        </StyledButton>

        <TempFilters />

        <TableWithLoader
          loadingText={loadingText}
          headData={headData}
          pagination={true}
          data={data}
          noDataLabel="Non ci sono servizi disponibili"
          error={error}
        >
          {data.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td>{item.version || '1'}</td>
              <td>{ESERVICE_STATUS_LABEL[item.status || 'draft']}</td>
              <td>
                {getAvailableActions(item).map((actionProps, j) => (
                  <Action key={j} {...actionProps} />
                ))}
              </td>
            </tr>
          ))}
        </TableWithLoader>
      </div>
    </React.Fragment>
  )
}
