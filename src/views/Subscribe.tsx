import React from 'react'
import { SectionHeader } from '../components/SectionHeader'
import { ProtectedSubroutes } from '../components/ProtectedSubroutes'
import { withLogin } from '../components/withLogin'
import { ROUTES } from '../lib/constants'

function SubscribeComponent() {
  return (
    <React.Fragment>
      <SectionHeader view="subscriber" />

      <ProtectedSubroutes
        subroutes={ROUTES.SUBSCRIBE.SUBROUTES!}
        redirectDestRoute={ROUTES.SUBSCRIBE.SUBROUTES!.CLIENT_LIST}
      />
    </React.Fragment>
  )
}

export const Subscribe = withLogin(SubscribeComponent)
