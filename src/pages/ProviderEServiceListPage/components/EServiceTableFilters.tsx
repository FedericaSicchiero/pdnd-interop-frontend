import React from 'react'
import { Button, Stack } from '@mui/material'
import { FormProvider } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { RHFAutocompleteMultiple, RHFTextField } from '@/components/shared/react-hook-form-inputs'
import { EServiceQueries } from '@/api/eservice'
import type { EServiceGetProviderListQueryFilters } from '@/api/eservice/eservice.api.types'
import { useTranslation } from 'react-i18next'
import { useAutocompleteFilterInput } from '@/hooks/useAutocompleteFilterInput'
import { Filters, FiltersParams } from '@/components/shared/filter-form-components/Filters'

interface EServiceTableFiltersProps {
  clearFilters: VoidFunction
  enableFilters: VoidFunction
  filtersUseFormMethods: UseFormReturn<EServiceGetProviderListQueryFilters, unknown>
}

const EServiceTableFilters: React.FC<EServiceTableFiltersProps> = ({
  clearFilters,
  enableFilters,
  filtersUseFormMethods,
}) => {
  const { t } = useTranslation('eservice')
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'actions' })
  const [consumersAutocompleteText, handleAutocompleteInputChange] = useAutocompleteFilterInput()

  const [params, setParams] = React.useState<FiltersParams>({})

  const { data: consumers, isInitialLoading } = EServiceQueries.useGetConsumers(
    { offset: 0, limit: 50, q: consumersAutocompleteText },
    { suspense: false, keepPreviousData: true }
  )

  const consumersOptions =
    consumers?.results.map((o) => ({
      label: o.name,
      value: o.id,
    })) || []

  return (
    <Filters
      params={params}
      setParams={setParams}
      isLoadingOptions={isInitialLoading}
      fields={[
        { name: 'q', label: t('list.filters.nameField.label'), type: 'single' },
        {
          name: 'consumersIds',
          label: t('list.filters.consumerField.label'),
          type: 'multiple',
          options: consumersOptions,
        },
      ]}
    />
  )

  // return (
  //   <FormProvider {...filtersUseFormMethods}>
  //     <Stack
  //       onSubmit={enableFilters}
  //       component="form"
  //       noValidate
  //       direction="row"
  //       spacing={2}
  //       justifyContent="space-between"
  //       sx={{ mb: 4 }}
  //     >
  //       <Stack direction="row" spacing={2} sx={{ width: '60%' }}>
  //         <RHFTextField
  //           sx={{ m: 0, width: '55%' }}
  //           size="small"
  //           name="q"
  //           label={t('list.filters.nameField.label')}
  //         />
  //         <RHFAutocompleteMultiple
  //           sx={{ width: '45%' }}
  //           placeholder=""
  //           size="small"
  //           name="consumersIds"
  //           onInputChange={handleAutocompleteInputChange}
  //           label={t('list.filters.consumerField.label')}
  //           options={consumersOptions}
  //         />
  //       </Stack>

  //       <Stack direction="row" spacing={2}>
  //         <Button size="small" variant="outlined" type="submit">
  //           {tCommon('filter')}
  //         </Button>
  //         <Button size="small" variant="text" type="button" onClick={clearFilters}>
  //           {tCommon('cancelFilter')}
  //         </Button>
  //       </Stack>
  //     </Stack>
  //   </FormProvider>
  // )
}

export default EServiceTableFilters
