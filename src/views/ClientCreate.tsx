import React, { useContext, useEffect, useState } from 'react'
import { StyledIntro } from '../components/Shared/StyledIntro'
import { ROUTES } from '../lib/constants'
import { StyledInputText } from '../components/Shared/StyledInputText'
import { StyledInputSelect } from '../components/Shared/StyledInputSelect'
import { useAsyncFetch } from '../hooks/useAsyncFetch'
import { EServiceReadType } from '../../types'
import { PartyContext } from '../lib/context'
import { useFeedback } from '../hooks/useFeedback'
import { StyledButton } from '../components/Shared/StyledButton'
import { StyledForm } from '../components/Shared/StyledForm'
import { Layout } from '../components/Shared/Layout'

type ClientSubmit = {
  name: string
  description: string
  consumerInstitutionId: string
  eServiceId: string
  purposes: string
}

export function ClientCreate() {
  const { runActionWithDestination } = useFeedback()
  const { party } = useContext(PartyContext)
  const [data, setData] = useState<Partial<ClientSubmit>>({})
  const { data: eserviceData } = useAsyncFetch<EServiceReadType[]>(
    {
      path: { endpoint: 'ESERVICE_GET_LIST' },
      config: { params: { consumerId: party?.partyId } },
    },
    {
      defaultValue: [],
      mapFn: (data) => {
        console.log(data)
        return data
      },
      loadingTextLabel: 'Stiamo caricando gli e-service associabili al client',
    }
  )

  const wrapSetData = (id: keyof ClientSubmit) => (e: any) => {
    setData({ ...data, [id]: e.target.value })
  }

  const handleSubmit = async (e: any) => {
    // Avoid page reload
    e.preventDefault()

    await runActionWithDestination(
      { path: { endpoint: 'CLIENT_CREATE' }, config: { data } },
      { destination: ROUTES.SUBSCRIBE.SUBROUTES!.CLIENT_LIST, suppressToast: false }
    )
  }

  useEffect(() => {
    // When e-service data is loaded, set the e-service select to the first available value
    if (eserviceData.length > 0) {
      setData({
        ...data,
        eServiceId: eserviceData[0].id,
        consumerInstitutionId: party?.institutionId,
      })
    }
  }, [eserviceData]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout>
      <StyledIntro priority={2}>
        {{
          title: `Crea nuovo client`,
          description:
            "Il client sarà associato ad uno specifico e-service. Una volta creato, sarà possibile aggiungere operatori di sicurezza che gestiranno le chiavi per permettere l'accesso machine-to-machine all'e-service",
        }}
      </StyledIntro>

      <StyledForm onSubmit={handleSubmit} style={{ maxWidth: 768 }}>
        <StyledInputText
          id="name"
          label="Nome del client*"
          value={data['name'] || ''}
          onChange={wrapSetData('name')}
        />

        <StyledInputText
          id="description"
          label="Descrizione del client*"
          value={data['description'] || ''}
          onChange={wrapSetData('description')}
        />

        <StyledInputSelect
          id="eserviceId"
          label="E-service da associare*"
          disabled={eserviceData.length === 0}
          options={[{ id: '-1', name: 'Seleziona servizio...' }, ...eserviceData].map((s) => ({
            value: s.id,
            label: s.name,
          }))}
          onChange={wrapSetData('eServiceId')}
        />

        <StyledInputText
          id="purposes"
          label="Finalità*"
          value={data['purposes'] || ''}
          onChange={wrapSetData('purposes')}
        />

        <StyledButton className="mt-3" variant="primary" type="submit" disabled={false}>
          crea client
        </StyledButton>
      </StyledForm>
    </Layout>
  )
}
