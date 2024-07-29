import { expect, it, describe } from '@jest/globals'
import { clearIncludeAction, includeAction, removeIncludeAction } from '@/actions'

describe('Include Action test: ', () => {
  it('should add a new include', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: []
    }

    const result = includeAction(['user'], state)

    expect(result.includes).toEqual(['user'])
  })

  it('should not add duplicate includes', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: ['user'],
      sorts: []
    }

    const result = includeAction(['user'], state)

    expect(result.includes).toEqual(['user'])
  })

  it('should be possible to add multiple includes', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: []
    }

    const result = includeAction(['user', 'works'], state)

    expect(result.includes).toEqual(['user', 'works'])
  })

  it('should be possible to remove an include', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: ['user', 'works'],
      sorts: []
    }

    const result = removeIncludeAction(['works'], state)

    expect(result.includes).toEqual(['user'])
  })

  it('should be possible to remove multiple includes', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: ['user', 'works'],
      sorts: []
    }

    const result = removeIncludeAction(['user', 'works'], state)

    expect(result.includes).toEqual([])
  })

  it('should clear all includes at once', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: ['user', 'works'],
      sorts: []
    }

    const result = clearIncludeAction(state)

    expect(result.includes).toEqual([])
  })
})
