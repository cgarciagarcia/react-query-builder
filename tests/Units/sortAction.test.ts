import { it, expect, describe } from '@jest/globals'
import { clearSortsAction, removeSortAction, sortAction } from '@/actions'
import { type GlobalState } from '@/types'


describe('Sort action test: ', () => {

  it('should add a new sort', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: []
    }

    const result = sortAction({
      attribute: 'name',
      direction: 'asc'
    }, state)

    expect(result.sorts).toEqual([
      {
        attribute: 'name',
        direction: 'asc'
      }
    ])
  })

  it('should not add duplicate sorts', () => {
    const state: GlobalState = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: [
        {
          attribute: 'name',
          direction: 'asc'
        }
      ]
    }

    const result = sortAction({
      attribute: 'name',
      direction: 'asc'
    }, state)

    expect(result.sorts).toEqual([
      {
        attribute: 'name',
        direction: 'asc'
      }
    ])
  })

  it('should be possible to add multiple sorts', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: []
    }

    const result = sortAction({
      attribute: 'name',
      direction: 'asc'
    }, state)

    expect(result.sorts).toEqual([
      {
        attribute: 'name',
        direction: 'asc'
      }
    ])

    const result2 = sortAction({
      attribute: 'age',
      direction: 'asc'
    }, result)

    expect(result2.sorts).toEqual([
      {
        attribute: 'name',
        direction: 'asc'
      },
      {
        attribute: 'age',
        direction: 'asc'
      }
    ])
  })

  it('should remove a sort', () => {
    const state: GlobalState = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: [
        {
          attribute: 'name',
          direction: 'asc'
        },
        {
          attribute: 'age',
          direction: 'desc'
        }
      ]
    }

    const result = removeSortAction(['name'], state)

    expect(result.sorts).toEqual([
      {
        attribute: 'age',
        direction: 'desc'
      }
    ])
  })

  it('should remove multiple sorts', () => {
    const state: GlobalState = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: [
        {
          attribute: 'name',
          direction: 'asc'
        },
        {
          attribute: 'age',
          direction: 'desc'
        }
      ]
    }

    const result = removeSortAction(['name', 'age'], state)

    expect(result.sorts).toEqual([])
  })

  it('should clear all sorts at once', () => {
    const state: GlobalState = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: [
        {
          attribute: 'name',
          direction: 'asc'
        },
        {
          attribute: 'age',
          direction: 'desc'
        }
      ]
    }

    const result = clearSortsAction(state)

    expect(result.sorts).toEqual([])
  })
})
