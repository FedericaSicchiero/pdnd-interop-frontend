import { useJwt } from '@/hooks/useJwt'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AgreementQueryKeys } from '../agreement'
import { useMutationWrapper, useQueryWrapper } from '../react-query-wrappers'
import AttributeServices from './attribute.services'

export enum AttributeQueryKeys {
  GetList = 'AttributeGetList',
  GetSingle = 'AttributeGetSingle',
  GetPartyCertifiedList = 'AttributeGetPartyCertifiedList',
  GetPartyVerifiedList = 'AttributeGetPartyVerifiedList',
  GetPartyDeclaredList = 'AttributeGetPartyDeclaredList',
  GetPartyList = 'AttributeGetPartyList',
}

function useGetList(search?: string, config = { suspense: true }) {
  return useQueryWrapper(
    [AttributeQueryKeys.GetList, search],
    () => AttributeServices.getList(search ? { search } : undefined),
    {
      select(data) {
        return data.attributes
      },
      ...config,
    }
  )
}

function useGetSingle(attributeId: string) {
  return useQueryWrapper([AttributeQueryKeys.GetSingle, attributeId], () =>
    AttributeServices.getSingle(attributeId)
  )
}

function usePrefetchSingle() {
  const queryClient = useQueryClient()
  return (attributeId: string) =>
    queryClient.prefetchQuery([AttributeQueryKeys.GetSingle, attributeId], () =>
      AttributeServices.getSingle(attributeId)
    )
}

function useGetPartyCertifiedList(partyId?: string) {
  return useQueryWrapper(
    [AttributeQueryKeys.GetPartyCertifiedList, partyId],
    () => AttributeServices.getPartyCertifiedList(partyId!),
    {
      enabled: !!partyId,
    }
  )
}

function usePrefetchPartyCertifiedList() {
  const queryClient = useQueryClient()
  return (partyId: string) =>
    queryClient.prefetchQuery([AttributeQueryKeys.GetPartyCertifiedList, partyId], () =>
      AttributeServices.getPartyCertifiedList(partyId)
    )
}

function useGetPartyVerifiedList(partyId?: string) {
  const { jwt } = useJwt()
  return useQueryWrapper(
    [AttributeQueryKeys.GetPartyVerifiedList, partyId],
    () => AttributeServices.getPartyVerifiedList(partyId!, jwt!.organizationId),
    {
      enabled: !!partyId && !!jwt?.organizationId,
    }
  )
}

function useGetPartyDeclaredList(partyId?: string) {
  return useQueryWrapper(
    [AttributeQueryKeys.GetPartyDeclaredList, partyId],
    () => AttributeServices.getPartyDeclaredList(partyId!),
    {
      enabled: !!partyId,
    }
  )
}

function useGetListParty(partyId?: string, config = { suspense: true }) {
  const { jwt } = useJwt()
  return useQueries({
    queries: [
      {
        queryKey: [AttributeQueryKeys.GetPartyCertifiedList, partyId],
        queryFn: () => AttributeServices.getPartyCertifiedList(partyId!),
        enabled: !!partyId,
        ...config,
      },
      {
        queryKey: [AttributeQueryKeys.GetPartyVerifiedList, partyId],
        queryFn: () => AttributeServices.getPartyVerifiedList(partyId!, jwt!.organizationId),
        enabled: !!partyId && !!jwt?.organizationId,
        ...config,
      },
      {
        queryKey: [AttributeQueryKeys.GetPartyDeclaredList, partyId],
        queryFn: () => AttributeServices.getPartyDeclaredList(partyId!),
        enabled: !!partyId,
        ...config,
      },
    ],
  })
}

function useCreate() {
  const { t } = useTranslation('mutations-feedback', { keyPrefix: 'attribute.create' })
  const queryClient = useQueryClient()
  return useMutationWrapper(AttributeServices.create, {
    suppressSuccessToast: true,
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    onSuccess(data) {
      queryClient.setQueryData([AttributeQueryKeys.GetSingle, data.id], data)
      queryClient.invalidateQueries([AttributeQueryKeys.GetList])
    },
  })
}

function useVerifyPartyAttribute() {
  const { t } = useTranslation('mutations-feedback', {
    keyPrefix: 'attribute.verifyPartyAttribute',
  })
  const queryClient = useQueryClient()
  return useMutationWrapper(AttributeServices.verifyPartyAttribute, {
    suppressSuccessToast: true,
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    showConfirmationDialog: true,
    dialogConfig: {
      title: t('confirmDialog.title'),
      description: t('confirmDialog.description'),
    },
    onSuccess(_, { id, partyId }) {
      queryClient.invalidateQueries([AttributeQueryKeys.GetPartyVerifiedList])
      queryClient.invalidateQueries([AttributeQueryKeys.GetPartyList, partyId])
      queryClient.invalidateQueries([AttributeQueryKeys.GetSingle, id])
      queryClient.invalidateQueries([AgreementQueryKeys.GetSingle])
      queryClient.invalidateQueries([AgreementQueryKeys.GetList])
    },
  })
}

function useRevokeVerifiedPartyAttribute() {
  const { t } = useTranslation('mutations-feedback', {
    keyPrefix: 'attribute.revokeVerifiedPartyAttribute',
  })
  const queryClient = useQueryClient()
  return useMutationWrapper(AttributeServices.revokeVerifiedPartyAttribute, {
    suppressSuccessToast: true,
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    showConfirmationDialog: true,
    dialogConfig: {
      title: t('confirmDialog.title'),
      description: t('confirmDialog.description'),
    },
    onSuccess(_, { attributeId, partyId }) {
      queryClient.invalidateQueries([AttributeQueryKeys.GetPartyVerifiedList])
      queryClient.invalidateQueries([AttributeQueryKeys.GetPartyList, partyId])
      queryClient.invalidateQueries([AttributeQueryKeys.GetSingle, attributeId])
      queryClient.invalidateQueries([AgreementQueryKeys.GetSingle])
      queryClient.invalidateQueries([AgreementQueryKeys.GetList])
    },
  })
}

function useDeclarePartyAttribute() {
  const { jwt } = useJwt()
  const { t } = useTranslation('mutations-feedback', {
    keyPrefix: 'attribute.declarePartyAttribute',
  })
  const queryClient = useQueryClient()
  return useMutationWrapper(AttributeServices.declarePartyAttribute, {
    suppressSuccessToast: true,
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    showConfirmationDialog: true,
    dialogConfig: {
      title: t('confirmDialog.title'),
      description: t('confirmDialog.description'),
    },
    onSuccess(_, { id }) {
      queryClient.invalidateQueries([AttributeQueryKeys.GetPartyDeclaredList, jwt?.organizationId])
      queryClient.invalidateQueries([AttributeQueryKeys.GetPartyList, jwt?.organizationId])
      queryClient.invalidateQueries([AttributeQueryKeys.GetSingle, id])
      queryClient.invalidateQueries([AgreementQueryKeys.GetSingle])
      queryClient.invalidateQueries([AgreementQueryKeys.GetList])
    },
  })
}

function useRevokeDeclaredPartyAttribute() {
  const { jwt } = useJwt()

  const { t } = useTranslation('mutations-feedback', {
    keyPrefix: 'attribute.revokeDeclaredPartyAttribute',
  })
  const queryClient = useQueryClient()
  return useMutationWrapper(AttributeServices.revokeDeclaredPartyAttribute, {
    suppressSuccessToast: true,
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    showConfirmationDialog: true,
    dialogConfig: {
      title: t('confirmDialog.title'),
      description: t('confirmDialog.description'),
    },
    onSuccess(_, { attributeId }) {
      queryClient.invalidateQueries([AttributeQueryKeys.GetPartyDeclaredList, jwt?.organizationId])
      queryClient.invalidateQueries([AttributeQueryKeys.GetPartyList, jwt?.organizationId])
      queryClient.invalidateQueries([AttributeQueryKeys.GetSingle, attributeId])
      queryClient.invalidateQueries([AgreementQueryKeys.GetSingle])
      queryClient.invalidateQueries([AgreementQueryKeys.GetList])
    },
  })
}

export const AttributeQueries = {
  useGetList,
  useGetSingle,
  usePrefetchSingle,
  useGetPartyCertifiedList,
  usePrefetchPartyCertifiedList,
  useGetPartyVerifiedList,
  useGetPartyDeclaredList,
  useGetListParty,
}

export const AttributeMutations = {
  useCreate,
  useVerifyPartyAttribute,
  useRevokeVerifiedPartyAttribute,
  useDeclarePartyAttribute,
  useRevokeDeclaredPartyAttribute,
}
