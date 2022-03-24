import { RunActionProps, ToastActionKeys } from '../../types'

export const TOAST_CONTENTS: Record<ToastActionKeys, RunActionProps> = {
  ESERVICE_GET_LIST_FLAT: { loadingText: 'Stiamo caricando gli E-Service' },
  ESERVICE_DRAFT_CREATE: {
    loadingText: 'Stiamo creando la bozza',
    success: { title: 'Bozza creata', description: 'la bozza è stata creata correttamente' },
    error: {
      title: "C'è stato un problema",
      description:
        'non è stato possibile creare la bozza. Verifica di aver compilato tutti i campi richiesti e riprova!',
    },
  },
  ESERVICE_DRAFT_UPDATE: {
    loadingText: 'Stiamo aggiornando la bozza',
    success: {
      title: 'Bozza aggiornata',
      description: 'la bozza è stata aggiornata correttamente',
    },
    error: {
      title: "C'è stato un problema",
      description:
        'non è stato possibile aggiornare la bozza. Verifica di aver compilato tutti i campi richiesti e riprova!',
    },
  },
  ESERVICE_DRAFT_DELETE: {
    loadingText: 'Stiamo cancellando la bozza',
    success: {
      title: 'Bozza cancellata correttamente',
      description: 'la bozza è stata cancellata correttamente',
    },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile cancellare la bozza. Per favore, riprova!',
    },
  },
  ESERVICE_CLONE_FROM_VERSION: {
    loadingText: "Stiamo clonando l'E-Service richiesto",
    success: {
      title: 'Nuova bozza disponibile',
      description: "l'E-Service è stato clonato correttamente ed è disponibile in bozza",
    },
    error: {
      title: "C'è stato un problema",
      description: "non è stato possibile clonare l'E-Service richiesto. Per favore, riprova!",
    },
  },
  ESERVICE_VERSION_DRAFT_CREATE: {
    loadingText: 'Stiamo creando la nuova versione (in bozza)',
    success: {
      title: 'Bozza creata correttamente',
      description: "la nuova versione della nuova versione dell'E-Service è disponibile in bozza",
    },
    error: {
      title: "C'è stato un problema",
      description:
        "non è stato possibile creare una bozza per la nuova versione dell'E-Service. Assicurarsi di aver compilato tutti i campi e riprovare",
    },
  },
  ESERVICE_VERSION_DRAFT_UPDATE: {
    loadingText: 'Stiamo aggiornando la nuova versione (in bozza)',
    success: {
      title: 'Bozza aggiornata correttamente',
      description: "la nuova versione della nuova versione dell'E-Service è disponibile in bozza",
    },
    error: {
      title: "C'è stato un problema",
      description:
        "non è stato possibile aggiornare una bozza per la nuova versione dell'E-Service. Assicurarsi di aver compilato tutti i campi e riprovare",
    },
  },
  ESERVICE_VERSION_DRAFT_PUBLISH: {
    loadingText: 'Stiamo pubblicando la versione in bozza',
    success: {
      title: 'Nuova versione disponibile',
      description: "la nuova versione dell'E-Service è stata pubblicata correttamente",
    },
    error: {
      title: "C'è stato un problema",
      description:
        "non è stato possibile pubblicare la nuova versione dell'E-Service. Verificare di aver caricato il documento di interfaccia e riprovare!",
    },
  },
  ESERVICE_VERSION_SUSPEND: {
    loadingText: 'Stiamo sospendendo la versione',
    success: {
      title: 'Versione sospesa',
      description: "la versione dell'E-Service è stata sospesa",
    },
    error: {
      title: "C'è stato un problema",
      description:
        "non è stato possibile sospendere questa versione dell'E-Service. Per favore, riprova!",
    },
  },
  ESERVICE_VERSION_REACTIVATE: {
    loadingText: 'Stiamo riattivando la versione',
    success: {
      title: 'Versione riattivata',
      description: "la versione dell'E-Service è stata riattivata",
    },
    error: {
      title: "C'è stato un problema",
      description:
        "non è stato possibile riattivare questa versione dell'E-Service. Per favore, riprova!",
    },
  },
  ESERVICE_VERSION_DRAFT_DELETE: {
    loadingText: 'Stiamo cancellando la bozza',
    success: {
      title: 'Bozza cancellata correttamente',
      description: 'la bozza è stata cancellata correttamente',
    },
    error: {
      title: "C'è stato un problema",
      description: "non è stato possibile cancellare la bozza dell'E-Service. Per favore, riprova!",
    },
  },
  ESERVICE_VERSION_DRAFT_POST_DOCUMENT: { loadingText: 'Stiamo caricando il documento' },
  ESERVICE_VERSION_DRAFT_DELETE_DOCUMENT: {
    loadingText: 'Stiamo eliminando il documento',
    success: { title: 'Successo', description: 'il documento è stato eliminato correttamente' },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile eliminare il documento. Per favore, riprova!',
    },
  },
  ESERVICE_VERSION_DOWNLOAD_DOCUMENT: {
    loadingText: 'Stiamo scaricando il documento',
    success: {
      title: 'Successo',
      description:
        'il documento è stato scaricato correttamente. Lo trovi nella cartella dei download del tuo device',
    },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile scaricare il documento. Per favore, riprova!',
    },
  },
  ESERVICE_VERSION_DRAFT_UPDATE_DOCUMENT_DESCRIPTION: {
    loadingText: 'Stiamo aggiornando la descrizione del documento',
    success: {
      title: 'Successo',
      description: 'la descrizione è stata aggiornata correttamente',
    },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile aggiornare la descrizione. Per favore, riprova!',
    },
  },
  OPERATOR_CREATE: {
    loadingText: 'Stiamo creando il nuovo operatore',
    success: {
      title: "C'è un nuovo operatore",
      description: 'nuovo operatore creato correttamente',
    },
    error: {
      title: "C'è stato un problema",
      description:
        "non è stato possibile creare il nuovo operatore. Assicurarsi che non esista già l'utenza ed eventualmente ritentare",
    },
  },
  OPERATOR_SECURITY_JOIN_WITH_CLIENT: {
    loadingText: "Stiamo associando l'operatore al client",
    success: {
      title: "C'è un nuovo operatore nel client",
      description: 'nuovo operatore associato correttamente',
    },
    error: {
      title: "C'è stato un problema",
      description:
        "non è stato possibile associare il nuovo operatore al suo client. Assicurarsi che non esista già l'utenza ed eventualmente ritentare",
    },
  },
  OPERATOR_SECURITY_REMOVE_FROM_CLIENT: {
    loadingText: "Stiamo rimuovendo l'operatore dal client",
    success: {
      title: 'Operatore rimosso',
      description: "l'operatore è stato rimosso correttamente dal client",
    },
    error: {
      title: "C'è stato un problema",
      description: "non è stato possibile rimuovere l'operatore dal client. Per favore, riprova!",
    },
  },
  ATTRIBUTE_CREATE: {
    loadingText: 'Stiamo salvando il nuovo attributo',
    success: {
      title: 'Attributo creato correttamente',
      description: "adesso puoi aggiungere l'attributo al tuo E-Service",
    },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile creare il nuovo attributo. Per favore, riprova!',
    },
  },
  AGREEMENT_CREATE: {
    loadingText: 'Stiamo inoltrando la richiesta di fruizione',
    success: {
      title: 'Richiesta inoltrata',
      description:
        'la richiesta è stata inoltrata correttamente ed è in attesa di approvazione. Riceverai notifiche di aggiornamento sul suo stato',
    },
    error: {
      title: "C'è stato un problema",
      description:
        "non è stato possibile inoltrare la richiesta. Se sei sicuro/a di averne diritto, contatta l'assistenza per ulteriori verifiche",
    },
  },
  AGREEMENT_VERIFY_ATTRIBUTE: {
    loadingText: "Stiamo verificando l'attributo",
    success: { title: 'Attributo verificato', description: "l'attributo è ora stato verificato" },
    error: {
      title: "C'è stato un problema",
      description: "non è stato possibile verificare l'attributo. Per favore, riprova!",
    },
  },
  AGREEMENT_ACTIVATE: {
    loadingText: 'Stiamo attivando la richiesta',
    success: {
      title: 'Accordo attivato',
      description:
        "la richiesta di fruizione è ora attiva, ed è possibile creare finalità da associare all'E-Service",
    },
    error: {
      title: "C'è stato un problema",
      description:
        'non è stato possibile attivare la richiesta. Accertarsi che tutti gli attributi siano stati verificati e riprovare',
    },
  },
  AGREEMENT_SUSPEND: {
    loadingText: 'Stiamo sospendendo la richiesta',
    success: {
      title: 'Accordo sospeso',
      description: 'non è più possibile per i client accedere al servizio in erogazione',
    },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile sospendere la richiesta. Per favore, riprova!',
    },
  },
  AGREEMENT_UPGRADE: {
    loadingText: 'Stiamo aggiornando la richiesta',
    success: {
      title: 'Richiesta aggiornata',
      description:
        "la richiesta di fruizione è stata aggiornata alla versione più recente dell'E-Service",
    },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile aggiornare la richiesta. Per favore, riprova!',
    },
  },
  PURPOSE_DRAFT_CREATE: {
    loadingText: 'Stiamo creando la bozza',
    error: {
      title: 'Errore',
      description: 'non è stato possibile creare la bozza di finalità. Per favore, riprova!',
    },
  },
  PURPOSE_DRAFT_UPDATE: {
    loadingText: 'Stiamo aggiornando la bozza',
    success: {
      title: 'Bozza aggiornata',
      description: 'la bozza di finalità è stata aggiornata correttamente',
    },
    error: {
      title: 'Errore',
      description: 'non è stato possibile aggiornare la bozza di finalità. Per favore, riprova!',
    },
  },
  PURPOSE_DRAFT_DELETE: {
    loadingText: 'Stiamo cancellando la finalità in bozza',
    success: {
      title: 'Finalità cancellata',
      description: 'la finalità è stata cancellata correttamente',
    },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile cancellare la finalità. Per favore, riprova!',
    },
  },
  PURPOSE_VERSION_DRAFT_CREATE: {
    loadingText: 'Stiamo aggiornando la bozza',
    error: {
      title: 'Errore',
      description: 'non è stato possibile aggiornare la bozza di finalità. Per favore, riprova!',
    },
  },
  PURPOSE_VERSION_DRAFT_UPDATE: {
    loadingText: 'Stiamo aggiornando la bozza',
    error: {
      title: 'Errore',
      description: 'non è stato possibile aggiornare la bozza di finalità. Per favore, riprova!',
    },
  },
  PURPOSE_VERSION_WAITING_FOR_APPROVAL_UPDATE: {
    loadingText: 'Stiamo aggiornando la data stimata di pubblicazione',
  },
  PURPOSE_VERSION_SUSPEND: {
    loadingText: 'Stiamo sospendendo la finalità',
    success: {
      title: 'Finalità sospesa',
      description:
        'non è più possibile per i client associati alla finalità accedere al servizio in erogazione',
    },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile sospendere la finalità. Per favore, riprova!',
    },
  },
  PURPOSE_VERSION_ACTIVATE: {
    loadingText: 'Stiamo pubblicando la finalità',
    success: {
      title: 'Finalità pubblicata',
      description:
        "la finalità è ora pubblicata. Attenzione: se il numero di chiamate eccede il limite stabilito dall'erogatore, sarà necessaria una sua approvazione per poter sfruttare quel carico",
    },
    error: {
      title: "C'è stato un problema",
      description:
        'non è stato possibile riattivare la finalità. Per favore, riprova! Se è la prima attivazione, assicurati che tutti i campi richiesti dalla finalità siano compilati',
    },
  },
  PURPOSE_VERSION_ARCHIVE: {
    loadingText: 'Stiamo archiviando la finalità',
    success: {
      title: 'Finalità archiviata',
      description:
        'la finalità è stata ora archiviata perché non più in uso. Potrai sempre creare nuove finalità',
    },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile archiviare la finalità. Per favore, riprova!',
    },
  },
  PURPOSE_VERSION_DELETE: {
    loadingText: "Stiamo cancellando l'aggiornamento al numero di chiamate",
    success: {
      title: 'Aggiornamento cancellato',
      description:
        "l'aggiornamento al numero di chiamate per questa finalità è stato cancellato. Potrai continuare a usare questa finalità con il numero di chiamate corrente",
    },
    error: {
      title: "C'è stato un problema",
      description: "non è stato possibile cancellare l'aggiornamento. Per favore, riprova!",
    },
  },
  CLIENT_CREATE: { loadingText: 'Stiamo creando il client richiesto' },
  CLIENT_DELETE: {
    loadingText: 'Stiamo cancellando il client richiesto',
    success: {
      title: 'Client cancellato correttamente',
      description: 'il client è stato cancellato correttamente',
    },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile cancellare il client. Per favore, riprova!',
    },
  },
  CLIENT_INTEROP_M2M_CREATE: { loadingText: 'Stiamo creando il client richiesto' },
  CLIENT_JOIN_WITH_PURPOSE: {
    loadingText: 'Stiamo associando il client alla finalità',
    success: {
      title: 'Client associato alla finalità',
      description: 'il client è stato associato alla finalità correttamente',
    },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile associare il client alla finalità. Per favore, riprova!',
    },
  },
  CLIENT_REMOVE_FROM_PURPOSE: {
    loadingText: 'Stiamo rimuovendo il client dalla finalità',
    success: {
      title: 'Client rimosso dalla finalità',
      description: 'il client è stato rimosso dalla finalità correttamente',
    },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile rimuovere il client dalla finalità. Per favore, riprova!',
    },
  },
  USER_SUSPEND: {
    loadingText: "Stiamo sospendendo l'operatore",
    success: {
      title: 'Operatore sospeso',
      description:
        "l'operatore richiesto è stato sospeso e non può più accedere alla piattaforma per quest'ente",
    },
    error: {
      title: "C'è stato un problema",
      description: "non è stato possibile sospendere l'operatore richiesto. Per favore, riprova!",
    },
  },
  USER_REACTIVATE: {
    loadingText: "Stiamo riattivando l'operatore",
    success: {
      title: 'Operatore riattivato',
      description:
        "l'operatore richiesto è stato riattivato e può nuovamente accedere alla piattaforma per quest'ente",
    },
    error: {
      title: "C'è stato un problema",
      description: "non è stato possibile riattivare l'operatore richiesto. Per favore, riprova!",
    },
  },
  KEY_POST: {
    loadingText: 'Stiamo caricando la chiave',
    success: {
      title: 'Chiave caricata',
      description:
        'la chiave è ora utilizzabile per firmare il token presso gli E-Service ai quali il client è associato',
    },
    error: {
      title: "C'è stato un problema",
      description:
        'non è stato possibile caricare la chiave. Assicurarsi sia nel formato corretto e riprovare. Attenzione: la stessa chiave non può essere caricata due volte',
    },
  },
  KEY_DELETE: {
    loadingText: 'Stiamo cancellando la chiave',
    success: {
      title: 'Chiave cancellata',
      description:
        'la chiave pubblica è stata cancellata correttamente. Da questo momento non potrà più essere usata per autenticarsi presso gli erogatori degli E-Service',
    },
    error: {
      title: "C'è stato un problema",
      description: 'non è stato possibile cancellare la chiave. Per favore, riprova!',
    },
  },
  KEY_DOWNLOAD: { loadingText: 'Stiamo scaricando la chiave' },
}
