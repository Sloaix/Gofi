import UrlUtil from '../src/utils/url.util'

/**
 * test convertPathToSegments
 */

test('/a/b/c segmets is [a,b,c]', () => {
    expect(UrlUtil.convertPathToSegments('/a/b/c')).toEqual(['a', 'b', 'c'])
})

test('/a/b/c/ segmets is [a,b,c]', () => {
    expect(UrlUtil.convertPathToSegments('/a/b/c/')).toEqual(['a', 'b', 'c'])
})

test('a/b/c segmets is [a,b,c]', () => {
    expect(UrlUtil.convertPathToSegments('a/b/c')).toEqual(['a', 'b', 'c'])
})

test('a/b/c/ segmets is [a,b,c]', () => {
    expect(UrlUtil.convertPathToSegments('a/b/c/')).toEqual(['a', 'b', 'c'])
})

test('/a segmets is [a]', () => {
    expect(UrlUtil.convertPathToSegments('/a')).toEqual(['a'])
})

test('/a/ segmets is [a]', () => {
    expect(UrlUtil.convertPathToSegments('/a/')).toEqual(['a'])
})

test('a segmets is [a]', () => {
    expect(UrlUtil.convertPathToSegments('a')).toEqual(['a'])
})

/**
 * tes parentPath
 */

test('/a/b/c is /a/b', () => {
    expect(UrlUtil.parentPath('/a/b/c')).toBe('/a/b')
})

test('/a/b/c/ is /a/b', () => {
    expect(UrlUtil.parentPath('/a/b/c/')).toBe('/a/b')
})

test('a/b/c is /a/b', () => {
    expect(UrlUtil.parentPath('a/b/c')).toBe('/a/b')
})

test('a/b/c/ is /a/b', () => {
    expect(UrlUtil.parentPath('a/b/c')).toBe('/a/b')
})

test('/a is /', () => {
    expect(UrlUtil.parentPath('/a')).toBe('/')
})

test(`'' is ''`, () => {
    expect(UrlUtil.parentPath('')).toBe('')
})

test(`/ is ''`, () => {
    expect(UrlUtil.parentPath('/')).toBe('')
})
