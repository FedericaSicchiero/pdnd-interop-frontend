import React from 'react'
import { MessageNoAction } from '../components/MessageNoAction'
import checkIllustration from '../assets/check-illustration.svg'

export function RejectRegistration() {
  return (
    <MessageNoAction
      title="Operazione conclusa"
      img={{ src: checkIllustration, alt: 'Icona del check' }}
      description={[
        <p>
          La procedura di registrazione è stata annullata, e tutti i dati sono stati cancellati
          correttamente. Se ci sarà un nuovo tentativo di invio del documento, verrà rifiutato.
        </p>,
      ]}
    />
  )
}