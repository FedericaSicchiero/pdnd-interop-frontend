import React from 'react'
import { Stack } from '@mui/material'
import { FilterTextField } from './FilterTextField'
import { FilterAutocompleteMultiple } from './FilterAutocompleteMultiple'
import type { FieldsValues, FilterFields, FilterOption, FiltersHandler } from '@/types/filter.types'

type FiltersFieldsProps = {
  fields: FilterFields
  onChangeActiveFilter: FiltersHandler
  fieldsValues: FieldsValues
  onFieldsValuesChange: (name: string, value: string | Array<FilterOption>) => void
}

export const FiltersFields: React.FC<FiltersFieldsProps> = ({
  fields,
  fieldsValues,
  onFieldsValuesChange,
  onChangeActiveFilter,
}) => {
  const debounceRef = React.useRef<NodeJS.Timeout>()
  const dataQueueRef = React.useRef<Record<string, FilterOption[]>>({})

  const enableDebouncedMultipleFieldFilters = () => {
    Object.entries(dataQueueRef.current).forEach(([filterKey, value]) => {
      onChangeActiveFilter('multiple', filterKey, value)
    })
    dataQueueRef.current = {}
  }

  const handleTextFieldKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    const target = event.target as HTMLInputElement
    if (target.type === 'button') return
    const filterKey = target.name

    target.blur()
    enableTextFieldFilter(filterKey)
  }

  const enableTextFieldFilter = (filterKey: string) => {
    const value = fieldsValues[filterKey]

    onChangeActiveFilter('single', filterKey, value)
    onFieldsValuesChange(filterKey, '')
  }

  const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filterKey = event.currentTarget.name
    const value = event.currentTarget.value
    onFieldsValuesChange(filterKey, value)
  }

  const handleAutocompleteMultipleChange = (
    filterKey: string,
    _: unknown,
    data: FieldsValues['string']
  ) => {
    onFieldsValuesChange(filterKey, data)
    dataQueueRef.current = { ...dataQueueRef.current, [filterKey]: data as FilterOption[] }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(enableDebouncedMultipleFieldFilters, 300)
  }

  return (
    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
      {fields.map((field) => {
        if (field.type === 'single')
          return (
            <FilterTextField
              sx={{ flex: 0.25 }}
              key={field.name}
              label={field.label}
              name={field.name}
              value={fieldsValues[field.name] as string}
              onChange={handleTextFieldChange}
              onKeyDown={handleTextFieldKeyDown}
              onIconClick={enableTextFieldFilter.bind(null, field.name)}
            />
          )
        if (field.type === 'multiple')
          return (
            <FilterAutocompleteMultiple
              sx={{ flex: 0.25 }}
              key={field.name}
              label={field.label}
              name={field.name}
              options={field.options}
              value={fieldsValues[field.name] as { label: string; value: string }[]}
              onChange={handleAutocompleteMultipleChange.bind(null, field.name)}
              setAutocompleteInput={field.setAutocompleteInput}
            />
          )
      })}
    </Stack>
  )
}