import TextUtil from '../src/utils/text.util'

/**
 * test isEmpty
 */

test(`'' is empty`, () => {
    expect(TextUtil.isEmpty('')).toEqual(true)
})

test(`'null' is empty`, () => {
    expect(TextUtil.isEmpty('null')).toEqual(true)
})

test(`null is empty`, () => {
    expect(TextUtil.isEmpty(null)).toEqual(true)
})

test(`undefined is empty`, () => {
    expect(TextUtil.isEmpty(undefined)).toEqual(true)
})
