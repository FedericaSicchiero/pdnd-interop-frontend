import React from 'react'
import { AttributeMutations } from '@/api/attribute'
import { PartyAttributesList, PartyAttributesListSkeleton } from './PartyAttributesList'
import { useTranslation } from 'react-i18next'
import { PartyQueries } from '@/api/party/party.hooks'
import { useJwt } from '@/hooks/useJwt'

export const RevokedDeclaredPartyAttributesList = () => {
  const { t } = useTranslation('party', { keyPrefix: 'attributes.revokedDeclared' })
  const { isAdmin } = useJwt()

  const { data } = PartyQueries.useGetActiveUserParty()
  const declaredAttributes = data?.attributes.declared ?? []
  const { mutate: declareAttribute } = AttributeMutations.useDeclarePartyAttribute()

  const handleDeclareAttribute = (id: string) => {
    declareAttribute({ id })
  }

  const actions = []

  if (isAdmin) {
    actions.push({
      label: t('declareActionLabel'),
      action: handleDeclareAttribute,
    })
  }

  const revokedAttributes = declaredAttributes.filter((attribute) => attribute.state === 'REVOKED')

  return (
    <PartyAttributesList
      title={t('title')}
      description={t('description')}
      noAttributesLabel={t('noAttributesLabel')}
      attributes={revokedAttributes}
      actions={actions}
      showRedBorder
    />
  )
}

export const RevokedDeclaredPartyAttributesListSkeleton = () => {
  const { t } = useTranslation('party', { keyPrefix: 'attributes.revokedDeclared' })
  return (
    <PartyAttributesListSkeleton title={t('title')} description={t('description')} showRedBorder />
  )
}
