import { describe, it, expect } from 'vitest'
import TextUtil from '../src/utils/text.util'

/**
 * test isEmpty
 */

describe('TextUtil.isEmpty', () => {
  it(`'' is empty`, () => {
    expect(TextUtil.isEmpty('')).toEqual(true)
  })

  it(`'null' is empty`, () => {
    expect(TextUtil.isEmpty('null')).toEqual(true)
  })

  it(`null is empty`, () => {
    expect(TextUtil.isEmpty(null)).toEqual(true)
  })

  it(`undefined is empty`, () => {
    expect(TextUtil.isEmpty(undefined)).toEqual(true)
  })
})
