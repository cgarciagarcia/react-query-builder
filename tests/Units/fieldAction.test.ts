import { it, expect, describe } from '@jest/globals'
import { clearFieldsAction, fieldAction, removeFieldAction } from '@/actions'


describe('Field action tests', () => {
  it('should add a new field', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: [],
      fields: []
    }

    const newState = fieldAction(['name'], state)
    expect(newState.fields).toEqual(['name'])
  })

  it('should not add duplicate fields', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: [],
      fields: ['name']
    }

    const newState = fieldAction(['name'], state)
    expect(newState.fields).toEqual(['name'])
  })

  it('should remove an existing field', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: [],
      fields: ['name']
    }

    const newState = removeFieldAction(['name'], state)
    expect(newState.fields).toEqual([])
  })

  it('should not remove a non-existing field', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: [],
      fields: ['name']
    }

    const newState = removeFieldAction(['age'], state)
    expect(newState.fields).toEqual(['name'])
  })

  it('should be able to remove multiple fields', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: [],
      fields: ['name','age']
    }

    const newState = removeFieldAction(['age', 'name'], state)
    expect(newState.fields).toEqual([])
  })

  it('should clear all fields at once', () => {
    const state = {
      aliases: {},
      filters: [],
      includes: [],
      sorts: [],
      fields: ['name', 'age']
    }

    const newState = clearFieldsAction(state)
    expect(newState.fields).toEqual([])
  })
})
