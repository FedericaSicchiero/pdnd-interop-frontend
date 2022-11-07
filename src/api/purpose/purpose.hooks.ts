import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useMutationWrapper, useQueryWrapper } from '../react-query-wrappers'
import PurposeServices from './purpose.services'
import { PurposeGetListUrlParams } from './purpose.api.types'
import { DecoratedPurpose } from '@/types/purpose.types'
import { removePurposeFromListCache } from './purpose.api.utils'

export enum PurposeQueryKeys {
  GetList = 'PurposeGetList',
  GetSingle = 'PurposeGetSingle',
}

function useGetList(params: PurposeGetListUrlParams) {
  return useQueryWrapper([PurposeQueryKeys.GetList, params], () => PurposeServices.getList(params))
}

function useGetSingle(purposeId: string, config: { suspense: boolean } = { suspense: true }) {
  return useQueryWrapper(
    [PurposeQueryKeys.GetSingle, purposeId],
    () => PurposeServices.getSingle(purposeId),
    { enabled: !!purposeId, ...config }
  )
}

function usePrefetchSingle() {
  const queryClient = useQueryClient()
  return (purposeId: string) =>
    queryClient.prefetchQuery([PurposeQueryKeys.GetSingle, purposeId], () =>
      PurposeServices.getSingle(purposeId)
    )
}

function useCreateDraft() {
  const { t } = useTranslation('mutations-feedback', { keyPrefix: 'purpose.createDraft' })
  const queryClient = useQueryClient()
  return useMutationWrapper(PurposeServices.createDraft, {
    suppressSuccessToast: true,
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    onSuccess(data) {
      queryClient.setQueryData([PurposeQueryKeys.GetSingle, data.id], data)
    },
  })
}

function useUpdateDraft() {
  const { t } = useTranslation('mutations-feedback', { keyPrefix: 'purpose.updateDraft' })
  const queryClient = useQueryClient()
  return useMutationWrapper(PurposeServices.updateDraft, {
    suppressSuccessToast: true,
    errorToastLabel: t('loading'),
    loadingLabel: t('outcome.error'),
    onSuccess(data) {
      queryClient.setQueryData([PurposeQueryKeys.GetSingle, data.id], data)
    },
  })
}

function useDeleteDraft() {
  const { t } = useTranslation('mutations-feedback', { keyPrefix: 'purpose.deleteDraft' })
  const queryClient = useQueryClient()

  return useMutationWrapper(PurposeServices.deleteDraft, {
    successToastLabel: t('outcome.success'),
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    showConfirmationDialog: true,
    dialogConfig: {
      title: t('confirmDialog.title'),
      description: t('confirmDialog.description'),
    },
    onSuccess(_, { purposeId }) {
      queryClient.removeQueries([PurposeQueryKeys.GetSingle, purposeId])
      queryClient.setQueriesData<Array<DecoratedPurpose>>(
        [PurposeQueryKeys.GetList],
        removePurposeFromListCache.bind(null, purposeId)
      )
    },
  })
}

function useCreateVersionDraft() {
  const { t } = useTranslation('mutations-feedback', { keyPrefix: 'purpose.createVersionDraft' })
  const queryClient = useQueryClient()
  return useMutationWrapper(PurposeServices.createVersionDraft, {
    successToastLabel: t('outcome.success'),
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    onSuccess(_, { purposeId }) {
      queryClient.invalidateQueries([PurposeQueryKeys.GetSingle, purposeId])
    },
  })
}

function useUpdateVersionDraft() {
  const { t } = useTranslation('mutations-feedback', {
    keyPrefix: 'purpose.updateVersionDraft',
  })
  const queryClient = useQueryClient()
  return useMutationWrapper(PurposeServices.updateVersionDraft, {
    suppressSuccessToast: true,
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    onSuccess(_, { purposeId }) {
      queryClient.invalidateQueries([PurposeQueryKeys.GetSingle, purposeId])
    },
  })
}

function useUpdateDailyCalls() {
  const { t } = useTranslation('mutations-feedback', {
    keyPrefix: 'purpose.updateDailyCalls',
  })
  const queryClient = useQueryClient()
  return useMutationWrapper(PurposeServices.updateDailyCalls, {
    successToastLabel: t('outcome.success'),
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    onSuccess(_, { purposeId }) {
      queryClient.invalidateQueries([PurposeQueryKeys.GetSingle, purposeId])
      queryClient.invalidateQueries([PurposeQueryKeys.GetList])
    },
  })
}

function useUpdateVersionWaitingForApproval() {
  const { t } = useTranslation('mutations-feedback', {
    keyPrefix: 'purpose.updateVersionWaitingForApproval',
  })
  const queryClient = useQueryClient()
  return useMutationWrapper(PurposeServices.updateVersionWaitingForApproval, {
    suppressSuccessToast: true,
    suppressErrorToast: true,
    loadingLabel: t('loading'),
    onSuccess(_, { purposeId }) {
      queryClient.invalidateQueries([PurposeQueryKeys.GetSingle, purposeId])
      queryClient.invalidateQueries([
        PurposeQueryKeys.GetList,
        { states: ['WAITING_FOR_APPROVAL'] },
      ])
    },
  })
}

function useDownloadRiskAnalysis() {
  const { t } = useTranslation('mutations-feedback', { keyPrefix: 'purpose.downloadRiskAnalysis' })
  return useMutationWrapper(PurposeServices.downloadRiskAnalysis, {
    loadingLabel: t('loading'),
    suppressSuccessToast: true,
    errorToastLabel: t('outcome.error'),
  })
}

function useSuspendVersion() {
  const { t } = useTranslation('mutations-feedback', { keyPrefix: 'purpose.suspendVersion' })
  const queryClient = useQueryClient()
  return useMutationWrapper(PurposeServices.suspendVersion, {
    successToastLabel: t('outcome.success'),
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    showConfirmationDialog: true,
    dialogConfig: {
      title: t('confirmDialog.title'),
      description: t('confirmDialog.description'),
    },
    onSuccess(_, { purposeId }) {
      queryClient.invalidateQueries([PurposeQueryKeys.GetList])
      queryClient.invalidateQueries([PurposeQueryKeys.GetSingle, purposeId])
    },
  })
}

function useActivateVersion() {
  const { t } = useTranslation('mutations-feedback', { keyPrefix: 'purpose.activateVersion' })
  const queryClient = useQueryClient()
  return useMutationWrapper(PurposeServices.activateVersion, {
    successToastLabel: t('outcome.success'),
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    showConfirmationDialog: true,
    dialogConfig: {
      title: t('confirmDialog.title'),
      description: t('confirmDialog.description'),
    },
    onSuccess(_, { purposeId }) {
      queryClient.invalidateQueries([PurposeQueryKeys.GetList])
      queryClient.invalidateQueries([PurposeQueryKeys.GetSingle, purposeId])
    },
  })
}

function useArchiveVersion() {
  const { t } = useTranslation('mutations-feedback', { keyPrefix: 'purpose.archiveVersion' })
  const queryClient = useQueryClient()
  return useMutationWrapper(PurposeServices.archiveVersion, {
    successToastLabel: t('outcome.success'),
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    showConfirmationDialog: true,
    dialogConfig: {
      title: t('confirmDialog.title'),
      description: t('confirmDialog.description'),
    },
    onSuccess(_, { purposeId }) {
      queryClient.invalidateQueries([PurposeQueryKeys.GetList])
      queryClient.invalidateQueries([PurposeQueryKeys.GetSingle, purposeId])
    },
  })
}

function useDeleteVersion() {
  const { t } = useTranslation('mutations-feedback', { keyPrefix: 'purpose.deleteVersion' })
  const queryClient = useQueryClient()
  return useMutationWrapper(PurposeServices.deleteVersion, {
    successToastLabel: t('outcome.success'),
    errorToastLabel: t('outcome.error'),
    loadingLabel: t('loading'),
    showConfirmationDialog: true,
    dialogConfig: {
      title: t('confirmDialog.title'),
      description: t('confirmDialog.description'),
    },
    onSuccess(_, { purposeId }) {
      queryClient.invalidateQueries([PurposeQueryKeys.GetList])
      queryClient.invalidateQueries([PurposeQueryKeys.GetSingle, purposeId])
    },
  })
}

export const PurposeQueries = {
  useGetList,
  useGetSingle,
  usePrefetchSingle,
}

export const PurposeMutations = {
  useCreateDraft,
  useUpdateDraft,
  useDeleteDraft,
  useCreateVersionDraft,
  useUpdateVersionDraft,
  useUpdateDailyCalls,
  useUpdateVersionWaitingForApproval,
  useDownloadRiskAnalysis,
  useSuspendVersion,
  useActivateVersion,
  useArchiveVersion,
  useDeleteVersion,
}
