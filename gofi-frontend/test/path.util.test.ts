import { describe, it, expect } from 'vitest'
import PathUtil from '../src/utils/path.util'

/**
 * test convertPathToSegments
 */

describe('PathUtil.convertPathToSegments', () => {
  it('/a/b/c segmets is [a,b,c]', () => {
    expect(PathUtil.convertPathToSegments('/a/b/c')).toEqual(['a', 'b', 'c'])
  })

  it('/a/b/c/ segmets is [a,b,c]', () => {
    expect(PathUtil.convertPathToSegments('/a/b/c/')).toEqual(['a', 'b', 'c'])
  })

  it('a/b/c segmets is [a,b,c]', () => {
    expect(PathUtil.convertPathToSegments('a/b/c')).toEqual(['a', 'b', 'c'])
  })

  it('a/b/c/ segmets is [a,b,c]', () => {
    expect(PathUtil.convertPathToSegments('a/b/c/')).toEqual(['a', 'b', 'c'])
  })

  it('/a segmets is [a]', () => {
    expect(PathUtil.convertPathToSegments('/a')).toEqual(['a'])
  })

  it('/a/ segmets is [a]', () => {
    expect(PathUtil.convertPathToSegments('/a/')).toEqual(['a'])
  })

  it('a segmets is [a]', () => {
    expect(PathUtil.convertPathToSegments('a')).toEqual(['a'])
  })
})

/**
 * test parentPath
 */

describe('PathUtil.parentPath', () => {
  it('/a/b/c is /a/b', () => {
    expect(PathUtil.parentPath('/a/b/c')).toBe('/a/b')
  })

  it('/a/b/c/ is /a/b', () => {
    expect(PathUtil.parentPath('/a/b/c/')).toBe('/a/b')
  })

  it('a/b/c is /a/b', () => {
    expect(PathUtil.parentPath('a/b/c')).toBe('/a/b')
  })

  it('a/b/c/ is /a/b', () => {
    expect(PathUtil.parentPath('a/b/c')).toBe('/a/b')
  })

  it('/a is /', () => {
    expect(PathUtil.parentPath('/a')).toBe('/')
  })

  it(`'' is ''`, () => {
    expect(PathUtil.parentPath('')).toBe('')
  })

  it(`/ is ''`, () => {
    expect(PathUtil.parentPath('/')).toBe('')
  })
})
