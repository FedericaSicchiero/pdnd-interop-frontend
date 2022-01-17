import React, { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'react-router-dom'
import { useMode } from '../hooks/useMode'
import { Party, ProviderOrSubscriber, UserOnCreate } from '../../types'
import { PartyContext } from '../lib/context'
import { buildDynamicRoute, parseSearch } from '../lib/router-utils'
import { StyledIntro, StyledIntroChildrenProps } from '../components/Shared/StyledIntro'
import { useFeedback } from '../hooks/useFeedback'
import { StyledButton } from '../components/Shared/StyledButton'
import { StyledForm } from '../components/Shared/StyledForm'
import { PlatformUserControlledForm } from '../components/Shared/PlatformUserControlledForm'
import { ROUTES } from '../config/routes'
import { Contained } from '../components/Shared/Contained'
import { AxiosResponse } from 'axios'

export function UserCreate() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()
  const { runActionWithDestination, runAction } = useFeedback()
  const location = useLocation()
  const mode = useMode()
  const currentMode = mode as ProviderOrSubscriber
  const { party } = useContext(PartyContext)

  const onSubmit = async ({ operator }: Record<string, Partial<UserOnCreate>>) => {
    const userData = {
      ...operator,
      role: 'OPERATOR',
      product: 'interop',
      productRole: mode === 'provider' ? 'api' : 'security',
    }

    const { institutionId } = party as Party
    const contract = { version: '1', path: 'contracts/v1/interop-contract.html' }
    const dataToPost = { users: [userData], institutionId, contract }

    if (mode === 'provider') {
      // Create the api operator
      await runActionWithDestination(
        { path: { endpoint: 'OPERATOR_CREATE' }, config: { data: dataToPost } },
        { destination: ROUTES.PROVIDE_OPERATOR_LIST, suppressToast: false }
      )
    } else {
      // First create the security operator
      const { response } = await runAction(
        { path: { endpoint: 'OPERATOR_CREATE' }, config: { data: dataToPost } },
        { suppressToast: false }
      )

      const { clientId } = parseSearch(location.search)
      // Then, join it with the client it belongs to
      await runActionWithDestination(
        {
          path: {
            endpoint: 'JOIN_OPERATOR_WITH_CLIENT',
            endpointParams: {
              clientId,
              relationshipId: (response as AxiosResponse).data.relationshipId,
            },
          },
        },
        {
          destination: buildDynamicRoute(ROUTES.SUBSCRIBE_CLIENT_EDIT, {
            id: clientId,
          }),
          suppressToast: false,
        }
      )
    }
  }

  const INTRO: Record<ProviderOrSubscriber, StyledIntroChildrenProps> = {
    provider: {
      title: 'Crea nuovo operatore API',
      description:
        "La figura dell'operatore API potrà gestire i tuoi servizi, crearne di nuovi, sospenderli e riattivarli, gestire le versioni. L'attivazione degli accordi di interoperabilità invece rimarrà esclusivamente sotto il controllo dell'Amministratore e dei suoi Delegati. Al nuovo utente verrà inviata una notifica all'indirizzo email indicato in questa form",
    },
    subscriber: {
      title: 'Crea nuovo operatore di sicurezza',
      description:
        "La figura dell'operatore di sicurezza potrà caricare una chiave pubblica per il client al quale è stato assegnato, ed eventualmente sospenderla o aggiornarla. Al nuovo utente verrà inviata una notifica all'indirizzo email indicato in questa form",
    },
  }

  return (
    <React.Fragment>
      <StyledIntro>{INTRO[currentMode]}</StyledIntro>

      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <Contained>
          <PlatformUserControlledForm prefix="operator" control={control} errors={errors} />
        </Contained>

        <StyledButton sx={{ mt: 8 }} variant="contained" type="submit">
          Crea operatore
        </StyledButton>
      </StyledForm>
    </React.Fragment>
  )
}
