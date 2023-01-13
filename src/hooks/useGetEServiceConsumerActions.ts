import { AgreementMutations } from '@/api/agreement'
import { useNavigateRouter } from '@/router'
import { ActionItem } from '@/types/common.types'
import { EServiceCatalog, EServiceDescriptorCatalog, EServiceState } from '@/types/eservice.types'
import { useTranslation } from 'react-i18next'
import { useJwt } from './useJwt'

function useGetEServiceConsumerActions<
  TDescriptor extends { id: string; state: EServiceState; version: string }
>(eservice?: EServiceCatalog | EServiceDescriptorCatalog['eservice'], descriptor?: TDescriptor) {
  const { isAdmin } = useJwt()
  const { navigate } = useNavigateRouter()
  const { t } = useTranslation('eservice')
  const { t: tCommon } = useTranslation('common')

  const { mutate: createAgreementDraft } = AgreementMutations.useCreateDraft()

  const hasValidAgreement = eservice?.agreement && !['REJECTED'].includes(eservice.agreement.state)
  const isMine = !!eservice?.isMine
  const isSubscribed = !!(hasValidAgreement && isAdmin)
  const hasAgreementDraft = eservice?.agreement && eservice.agreement.state === 'DRAFT' && isAdmin

  const actions: Array<ActionItem> = []
  let canCreateAgreementDraft = false

  // I can subscribe to the eservice only if...
  if (eservice) {
    // ... I own all the certified attributes or...
    if (eservice.hasCertifiedAttributes) {
      canCreateAgreementDraft = true
    }

    // ... if it is mine...
    if (isMine) {
      canCreateAgreementDraft = true
    }

    // ... but only if I don't have an valid agreement with it yet, I'm an admin...
    if (hasValidAgreement || !isAdmin) {
      canCreateAgreementDraft = false
    }

    // ... and the actual viewing descriptor is published or suspended!
    if (descriptor && !['PUBLISHED', 'SUSPENDED'].includes(descriptor?.state)) {
      canCreateAgreementDraft = false
    }

    if (isAdmin && hasValidAgreement) {
      // Possible actions

      // If there is an valid agreement for this e-service add a "Go to Agreement" action
      const handleGoToAgreementRequest = () => {
        const routeKey = hasAgreementDraft ? 'SUBSCRIBE_AGREEMENT_EDIT' : 'SUBSCRIBE_AGREEMENT_READ'

        navigate(routeKey, {
          params: {
            agreementId: eservice.agreement?.id as string,
          },
        })
      }

      actions.push({
        action: handleGoToAgreementRequest,
        label: t('tableEServiceCatalog.goToRequestCta'),
      })
    }

    if (canCreateAgreementDraft) {
      const handleCreateAgreementDraft = () => {
        if (!descriptor) return
        createAgreementDraft(
          {
            eserviceName: eservice.name,
            eserviceId: eservice.id,
            eserviceVersion: descriptor.version,
            descriptorId: descriptor.id,
          },
          {
            onSuccess({ id }) {
              navigate('SUBSCRIBE_AGREEMENT_EDIT', { params: { agreementId: id } })
            },
          }
        )
      }
      actions.push({
        action: handleCreateAgreementDraft,
        label: tCommon('actions.subscribe'),
      })
    }
  }

  return { actions, canCreateAgreementDraft, isMine, isSubscribed, hasAgreementDraft }
}

export default useGetEServiceConsumerActions