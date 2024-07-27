import { build } from '@/utils'
import { expect, it, describe } from '@jest/globals'


describe('Assert build method is working correctly', () => {
  it('should return a empty url', () => {
    const val = build({
      aliases: {},
      filters: [],
      includes: [],
      sorts: []
    })
    expect(val).toBe('')
  })

  it('should return a valid query with one filter', () => {
    const val = build({
      aliases: {},
      filters: [
        {
          attribute: 'date',
          value: ['2024-01-01']
        }
      ],
      includes: [],
      sorts: []
    })
    expect(val).toBe('?filter[date]=2024-01-01')
  })

  it('should return a valid query with multiple values for one filter', () => {
    const val = build({
      aliases: {},
      filters: [
        {
          attribute: 'date',
          value: ['2024-01-01', '2024-01-02']
        },
        {
          attribute: 'name',
          value: ['Carlos garcia']
        }
      ],
      includes: [],
      sorts: []
    })
    expect(val).toBe('?filter[date]=2024-01-01,2024-01-02&filter[name]=Carlos+garcia')
  })

  it('should return a valid query with include', () => {
    expect(build({
      aliases: {},
      filters: [],
      includes: ['user'],
      sorts: []
    })).toBe('?include=user')
  })

  it('should return a valid query with multiple includes', () => {
    expect(build({
      aliases: {},
      filters: [],
      includes: ['user', 'works'],
      sorts: []
    })).toBe('?include=user,works')
  })

  it('should return a valid query with sorts ascending', () => {
    expect(build({
      aliases: {},
      filters: [],
      includes: [],
      sorts: [
        {
          attribute: 'name',
          direction: 'asc'
        }
      ]
    })).toBe(
      '?sort=name'
    )
  })

  it('should return a valid query with sorts descending', () => {
    expect(build({
      aliases: {},
      filters: [],
      includes: [],
      sorts: [
        {
          attribute: 'name',
          direction: 'desc'
        }
      ]
    })).toBe(
      '?sort=-name'
    )
  })

  it('should return a valid query string with filters, includes, and sorts', () => {
    expect(build({
      aliases: {},
      filters: [
        {
          attribute: 'name',
          value: ['Carlos garcia']
        },
        {
          attribute: 'date',
          value: ['2024-01-01', '2024-01-02']
        }
      ],
      includes: ['user', 'works'],
      sorts: [
        {
          attribute: 'name',
          direction: 'asc'
        },
        {
          attribute: 'date',
          direction: 'desc'
        }
      ]
    })).toBe(
      '?filter[name]=Carlos+garcia&filter[date]=2024-01-01,2024-01-02&sort=name,-date&include=user,works'
    )
  })

  it('Should return a valid query string filter using aliases', () => {
    const state = {
      aliases: {
        user: 'u'
      },
      filters: [
        {
          attribute: 'user',
          value: ['1']
        }
      ],
      includes: [],
      sorts: []
    }

    expect(build(state)).toBe(
      '?filter[u]=1'
    )
  })
})
