import React, { useContext, useEffect, useState } from 'react'
import { AxiosResponse } from 'axios'
import isEmpty from 'lodash/isEmpty'
import { Button } from 'react-bootstrap'
import { Overlay } from './Overlay'
import { ToastContentWithOutcome, ToastProps, User } from '../../types'
import { fetchWithLogs } from '../lib/api-utils'
import { getFetchOutcome } from '../lib/error-utils'
import { ActionWithTooltip } from './ActionWithTooltip'
import { CreateKeyModal } from './CreateKeyModal'
import { StyledIntro } from './StyledIntro'
import { StyledToast } from './StyledToast'
import { WhiteBackground } from './WhiteBackground'
import { UserContext } from '../lib/context'
import { DescriptionBlock } from './DescriptionBlock'

type SecurityOperatorKeysProps = {
  clientId: string
  userData: User
  runAction: any
  forceRerenderCounter: any
  wrapActionInDialog: any
}

export function SecurityOperatorKeys({
  clientId,
  userData,
  runAction,
  wrapActionInDialog,
  forceRerenderCounter,
}: SecurityOperatorKeysProps) {
  const { user } = useContext(UserContext)
  const [key, setKey] = useState<any>()
  const endpointParams = { taxCode: userData.taxCode, clientId }
  const [toast, setToast] = useState<ToastProps | undefined>()
  const [dialog, setDialog] = useState(false)
  const [keyCreationCounter, setKeyCreationCounter] = useState(0)

  const closeToast = () => {
    setToast(undefined)
  }

  const openModal = () => {
    setDialog(true)
  }

  const closeModal = (toastContent?: ToastContentWithOutcome) => {
    setDialog(false)
    if (!isEmpty(toastContent)) {
      setToast({ ...toastContent!, onClose: closeToast })
    }
  }

  const updateKeyCreationCounter = () => {
    setKeyCreationCounter(keyCreationCounter + 1)
  }

  /*
   * List of keys related actions to perform
   */
  useEffect(() => {
    async function asyncFetchKeys() {
      const resp = await fetchWithLogs(
        { endpoint: 'OPERATOR_SECURITY_KEYS_GET', endpointParams },
        { method: 'GET' }
      )
      const outcome = getFetchOutcome(resp)

      setKey(undefined)
      if (outcome === 'success') {
        const axiosResp = resp as AxiosResponse
        if (axiosResp.data.keys.length > 0) {
          setKey(axiosResp.data.keys[0])
        }
      }
    }

    asyncFetchKeys()
  }, [forceRerenderCounter, keyCreationCounter]) // eslint-disable-line react-hooks/exhaustive-deps

  const wrapDownloadKey = (keyId: string) => (e: any) => {
    runAction(
      {
        path: {
          endpoint: 'OPERATOR_SECURITY_KEY_DOWNLOAD',
          endpointParams: { operatorId: endpointParams.taxCode, keyId },
        },
        config: { method: 'GET' },
      },
      { suppressToast: false }
    )
  }

  const wrapSuspendKey = (keyId: string) => (e: any) => {
    runAction(
      {
        path: {
          endpoint: 'OPERATOR_SECURITY_KEY_DISABLE',
          endpointParams: { ...endpointParams, keyId },
        },
        config: { method: 'PATCH' },
      },
      { suppressToast: false }
    )
  }

  const wrapReactivateKey = (keyId: string) => (e: any) => {
    runAction(
      {
        path: {
          endpoint: 'OPERATOR_SECURITY_KEY_ENABLE',
          endpointParams: { ...endpointParams, keyId },
        },
        config: { method: 'PATCH' },
      },
      { suppressToast: false }
    )
  }

  const wrapDeleteKey = (keyId: string) => (e: any) => {
    runAction(
      {
        path: {
          endpoint: 'OPERATOR_SECURITY_KEY_DELETE',
          endpointParams: { ...endpointParams, keyId },
        },
        config: { method: 'DELETE' },
      },
      { suppressToast: false }
    )
  }

  const getAvailableActions = (key: any) => {
    const actions: any = [
      {
        onClick: wrapDownloadKey(key.key.kid),
        label: 'Scarica chiave',
        icon: 'bi-download',
      },
      key.status === 'Active'
        ? {
            onClick: wrapActionInDialog(
              wrapSuspendKey(key.key.kid),
              'OPERATOR_SECURITY_KEY_DISABLE'
            ),
            label: 'Sospendi chiave',
            icon: 'bi-pause-circle',
          }
        : {
            onClick: wrapActionInDialog(
              wrapReactivateKey(key.key.kid),
              'OPERATOR_SECURITY_KEY_ENABLE'
            ),
            label: 'Riattiva chiave',
            icon: 'bi-play-circle',
          },
      {
        onClick: wrapActionInDialog(wrapDeleteKey(key.key.kid), 'OPERATOR_SECURITY_KEY_DELETE'),
        label: 'Cancella chiave',
        icon: 'bi-trash',
      },
    ]

    return actions
  }

  return (
    <React.Fragment>
      <WhiteBackground>
        <StyledIntro priority={3}>{{ title: 'Gestione chiave pubblica' }}</StyledIntro>

        {user?.taxCode === userData.taxCode && !key && (
          <Button className="mb-4" onClick={openModal} variant="primary">
            carica nuova chiave
          </Button>
        )}

        {key ? (
          <React.Fragment>
            <div className="d-flex justify-content-between align-items-center border-top border-bottom py-3">
              <span>Chiave pubblica</span>
              <div>
                {getAvailableActions(key).map((tableAction: any, j: number) => {
                  return (
                    <ActionWithTooltip
                      key={j}
                      btnProps={{ onClick: tableAction.onClick }}
                      label={tableAction.label}
                      iconClass={tableAction.icon}
                      isMock={tableAction.isMock}
                    />
                  )
                })}
              </div>
            </div>
            <div className="mt-4">
              <DescriptionBlock label="Id del client">
                <span>{clientId}</span>
              </DescriptionBlock>
              <DescriptionBlock label="Id della chiave">
                <span>{key.key.kid}</span>
              </DescriptionBlock>
            </div>
          </React.Fragment>
        ) : (
          <div>Nessuna chiave presente</div>
        )}
      </WhiteBackground>

      {dialog && (
        <Overlay>
          <CreateKeyModal
            close={closeModal}
            clientId={clientId}
            taxCode={userData.taxCode}
            afterSuccess={updateKeyCreationCounter}
          />
        </Overlay>
      )}
      {toast && <StyledToast {...toast} />}
    </React.Fragment>
  )
}