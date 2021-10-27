import React, { useContext, useEffect, useState } from 'react'
import { AxiosResponse } from 'axios'
import isEmpty from 'lodash/isEmpty'
import { ActionProps, SecurityOperatorPublicKey, ToastContentWithOutcome, User } from '../../types'
import { fetchWithLogs } from '../lib/api-utils'
import { getFetchOutcome } from '../lib/error-utils'
import { Action } from './Action'
import { CreateKeyModal } from './CreateKeyModal'
import { StyledIntro } from './Shared/StyledIntro'
import { ToastContext, UserContext } from '../lib/context'
import { DescriptionBlock } from './DescriptionBlock'
import { downloadFile } from '../lib/file-utils'
import { ROUTES } from '../lib/constants'
import { StyledButton } from './Shared/StyledButton'
import { StyledLink } from './Shared/StyledLink'

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
  const { setToast } = useContext(ToastContext)
  const [modal, setModal] = useState(false)
  const [keyCreationCounter, setKeyCreationCounter] = useState(0)

  const closeToast = () => {
    setToast(null)
  }

  const openModal = () => {
    setModal(true)
  }

  const closeModal = (toastContent?: ToastContentWithOutcome) => {
    setModal(false)
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
      const resp = await fetchWithLogs({
        path: {
          endpoint: 'OPERATOR_SECURITY_KEYS_GET',
          endpointParams: { taxCode: userData.taxCode, clientId },
        },
      })
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

  const wrapDownloadKey = (keyId: string) => async (_: any) => {
    const { response, outcome } = await runAction(
      {
        path: {
          endpoint: 'OPERATOR_SECURITY_KEY_DOWNLOAD',
          endpointParams: { clientId, keyId },
        },
      },
      { suppressToast: true }
    )

    if (outcome === 'success') {
      const decoded = atob(response.data.key)
      downloadFile(decoded, 'public_key')
    }
  }

  const wrapDeleteKey = (keyId: string) => async (_: any) => {
    await runAction(
      {
        path: {
          endpoint: 'OPERATOR_SECURITY_KEY_DELETE',
          endpointParams: { clientId, keyId },
        },
      },
      { suppressToast: false }
    )
  }

  const getAvailableActions = (key: SecurityOperatorPublicKey) => {
    const actions: ActionProps[] = [
      {
        btnProps: { onClick: wrapDownloadKey(key.kid) },
        label: 'Scarica chiave',
      },
      {
        btnProps: {
          onClick: wrapActionInDialog(wrapDeleteKey(key.kid), 'OPERATOR_SECURITY_KEY_DELETE'),
        },
        label: 'Cancella chiave',
      },
    ]

    return actions
  }

  return (
    <React.Fragment>
      <StyledIntro variant="h4">
        {{
          title: 'Gestione chiave pubblica',
          description: (
            <React.Fragment>
              Per maggiori dettagli,{' '}
              <StyledLink
                to={ROUTES.SECURITY_KEY_GUIDE.PATH}
                title="Vai alla guida per la creazione delle chiavi di sicurezza"
                target="_blank"
                rel="noreferrer noopener"
              >
                consulta la guida
              </StyledLink>
            </React.Fragment>
          ),
        }}
      </StyledIntro>

      {user?.taxCode === userData.taxCode && !key && (
        <StyledButton className="mb-4" onClick={openModal} variant="contained">
          Carica nuova chiave
        </StyledButton>
      )}

      {key ? (
        <React.Fragment>
          <div className="d-flex justify-content-between align-items-center border-top border-bottom py-3">
            <span>Chiave pubblica</span>
            <div>
              {getAvailableActions(key.key).map((actionProps, j) => (
                <Action key={j} {...actionProps} />
              ))}
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

      {modal && (
        <CreateKeyModal
          close={closeModal}
          clientId={clientId}
          taxCode={userData.taxCode}
          afterSuccess={updateKeyCreationCounter}
        />
      )}
    </React.Fragment>
  )
}
