import { expect, it, describe } from '@jest/globals'
import { clearFiltersAction, filterAction, removeFilterAction } from '@/actions'


describe('Filter Action test: ', () => {
  it('should add a new filter', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: []
    }

    const result = filterAction('name', 'Carlos Garcia', state)

    expect(result.filters).toEqual([
      {
        attribute: 'name',
        value: ['Carlos Garcia']
      }
    ])
  })

  it('Should update an existing filter', () => {
    const state = {
      aliases: {},
      filters: [
        {
          attribute: 'name',
          value: ['Carlos Garcia']
        }
      ],
      includes: [],
      sorts: []
    }

    const result = filterAction('name', ['Juan Perez'], state)

    expect(result.filters).toEqual([
      {
        attribute: 'name',
        value: ['Carlos Garcia', 'Juan Perez']
      }
    ])
  })

  it('Should be possible to add multiple filter with the same attribute', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: []
    }

    const result = filterAction('name', ['Carlos Garcia', 'Juan Perez'], state)

    expect(result.filters).toEqual([
      {
        attribute: 'name',
        value: ['Carlos Garcia', 'Juan Perez']
      }
    ])
  })

  it('Should possible to remove a filter', () => {
    const state = {
      aliases: {},
      filters: [
        {
          attribute: 'name',
          value: ['Carlos Garcia', 'Juan Perez']
        },
        {
          attribute: 'age',
          value: [28]
        }
      ],
      includes: [],
      sorts: []
    }

    const result = removeFilterAction(['name'], state)

    expect(result.filters).toEqual([
      {
        attribute: 'age',
        value: [28]
      }
    ])
  })

  it('Should be possible to remove multiple filters at the same time', () => {
    const state = {
      aliases: {},
      filters: [
        {
          attribute: 'name',
          value: ['Carlos Garcia', 'Juan Perez']
        },
        {
          attribute: 'age',
          value: [28]
        }
      ],
      includes: [],
      sorts: []
    }

    const result = removeFilterAction(['name', 'age'], state)

    expect(result.filters).toEqual([])
  })

  it ('Should clear all filters at once', () => {
    const state = {
      aliases: {},
      filters: [
        {
          attribute: 'name',
          value: ['Carlos Garcia', 'Juan Perez']
        },
        {
          attribute: 'age',
          value: [28]
        }
      ],
      includes: [],
      sorts: []
    }

    const result = clearFiltersAction(state)

    expect(result.filters).toEqual([])
  })

  it('Should be possible to add a new filter with an alias', () => {
    const state = {
      aliases: {
        user: 'u'
      },
      filters: [
        {
          attribute: 'user',
          value: ['Carlos']
        }
      ],
      includes: [],
      sorts: []
    }

    const result = filterAction('last_name', 'Garcia', state)

    expect(result.filters).toEqual([
      {
        attribute: 'user',
        value: ['Carlos']
      },
      {
        attribute: 'last_name',
        value: ['Garcia']
      }
    ])
  })

})
