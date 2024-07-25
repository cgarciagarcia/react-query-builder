import { type GlobalState } from '../types'

export const build = <T> (state: GlobalState<T>): string => {
  const filters = state.filters.reduce(
    (acc, filter) => ({
      ...acc,
      [`filters[${filter.attribute}]`]: filter.value.join(',')
    }),
    {}
  )

  const sorts = state.sorts.reduce((acc, sort) => {
    const { attribute, direction } = sort
    const dir = direction === 'desc' ? '-' : ''
    acc.push(`${dir}${attribute}`)
    return acc
  }, [] as string[])

  const includes = state.includes.join(',')

  const urlSearchParams = new URLSearchParams({
    ...filters
  })

  if (sorts.length > 0) {
    urlSearchParams.append('sort', sorts.join(','))
  }

  if (includes) {
    urlSearchParams.append('include', includes)
  }

  const searchParamsString = urlSearchParams.toString()

  return searchParamsString ? '?' + urlSearchParams.toString() : ''
}
