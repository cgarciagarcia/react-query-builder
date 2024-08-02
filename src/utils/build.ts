import { type GlobalState } from '@/types'
import { usingAlias } from '@/utils/alias'

export const build = <T> (state: GlobalState<T>): string => {
  const filters = state.filters.reduce(
    (acc, filter) => ({
      ...acc,
      [`filter[${usingAlias(state, filter.attribute)}]`]: filter.value.join(state.delimiters.filters ?? state.delimiters.global)
    }),
    {}
  )

  const fieldsToString: Record<string, string> = {}
  if (state.fields.length > 0) {
    const fields = state.fields.reduce<Record<string, string[]>>((acc, field) => {
      const [entity, prop] = field.split('.') as [string, string]

      if (prop) {
        acc[`fields[${entity}]`] = [...(acc[`fields[${entity}]`] ?? []), prop]
      } else {
        acc.fields = [...(acc.fields ?? []), entity]
      }

      return acc
    }, {})

    for (const field in fields) {
      if (fields[field])
        fieldsToString[field] = fields[field].join(state.delimiters.fields ?? state.delimiters.global)
    }
  }

  const urlSearchParams = new URLSearchParams({
    ...filters,
    ...fieldsToString
  })

  const sorts = state.sorts.reduce((acc, sort) => {
    const { attribute, direction } = sort
    const dir = direction === 'desc' ? '-' : ''
    acc.push(`${dir}${attribute}`)
    return acc
  }, [] as string[])

  if (sorts.length > 0) {
    urlSearchParams.append('sort', sorts.join(state.delimiters.sorts ?? state.delimiters.global))
  }

  if (state.includes.length > 0) {
    urlSearchParams.append(
      'include',
      state.includes.join(state.delimiters.includes ?? state.delimiters.global)
    )
  }

  const searchParamsString = urlSearchParams.toString()

  return searchParamsString ? '?' + decodeURIComponent(searchParamsString) : ''
}
