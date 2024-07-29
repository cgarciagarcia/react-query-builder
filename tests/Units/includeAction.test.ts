import { expect, it, describe } from '@jest/globals'
import { clearIncludeAction, includeAction, removeIncludeAction } from '@/actions'
import  { type GlobalState } from '@/types'

describe('Include Action test: ', () => {
  it('should add a new include', () => {
    const state: GlobalState = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: [],
      fields: []
    }

    const result = includeAction(['user'], state)

    expect(result.includes).toEqual(['user'])
  })

  it('should not add duplicate includes', () => {
    const state: GlobalState = {
      aliases: {},
      filters: [],
      includes: ['user'],
      sorts: [],
      fields: []
    }

    const result = includeAction(['user'], state)

    expect(result.includes).toEqual(['user'])
  })

  it('should be possible to add multiple includes', () => {
    const state: GlobalState = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: [],
      fields: []
    }

    const result = includeAction(['user', 'works'], state)

    expect(result.includes).toEqual(['user', 'works'])
  })

  it('should be possible to remove an include', () => {
    const state: GlobalState = {
      aliases: {},
      filters: [],
      includes: ['user', 'works'],
      sorts: [],
      fields: []
    }

    const result = removeIncludeAction(['works'], state)

    expect(result.includes).toEqual(['user'])
  })

  it('should be possible to remove multiple includes', () => {
    const state: GlobalState = {
      aliases: {},
      filters: [],
      includes: ['user', 'works'],
      sorts: [],
      fields: []
    }

    const result = removeIncludeAction(['user', 'works'], state)

    expect(result.includes).toEqual([])
  })

  it('should clear all includes at once', () => {
    const state: GlobalState = {
      aliases: {},
      filters: [],
      includes: ['user', 'works'],
      sorts: [],
      fields: []
    }

    const result = clearIncludeAction(state)

    expect(result.includes).toEqual([])
  })
})
