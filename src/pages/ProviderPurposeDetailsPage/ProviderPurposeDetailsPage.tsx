import { PurposeQueries } from '@/api/purpose'
import { PageBottomActionsContainer, PageContainer } from '@/components/layout/containers'
import useGetProviderPurposesActions from '@/hooks/useGetProviderPurposesActions'
import { RouterLink, useRouteParams } from '@/router'
import { formatTopSideActions } from '@/utils/common.utils'
import React from 'react'
import { PurposeDetails, PurposeDetailsSkeleton } from './components/PurposeDetails'
import { useTranslation } from 'react-i18next'

const ProviderPurposeDetailsPage: React.FC = () => {
  const { t } = useTranslation('purpose')
  const { purposeId } = useRouteParams<'PROVIDE_PURPOSE_DETAILS'>()

  const { data: purpose, isLoading } = PurposeQueries.useGetSingle(purposeId, { suspense: false })

  const { actions } = useGetProviderPurposesActions(purpose)
  const topSideActions = formatTopSideActions(actions)

  return (
    <PageContainer
      title={purpose?.title}
      description={purpose?.description}
      isLoading={isLoading}
      topSideActions={topSideActions}
    >
      <React.Suspense fallback={<PurposeDetailsSkeleton />}>
        <PurposeDetails purposeId={purposeId} />
      </React.Suspense>
      <PageBottomActionsContainer>
        <RouterLink variant="outlined" to="PROVIDE_PURPOSE_LIST" as="button">
          {t('backToPurposeListBtn')}
        </RouterLink>
      </PageBottomActionsContainer>
    </PageContainer>
  )
}

export default ProviderPurposeDetailsPage
