vi.mock('@redwoodjs/project-config', async (importOriginal) => {
  const originalProjectConfig = await importOriginal()
  return {
    ...originalProjectConfig,
    getPaths: () => {
      return {
        api: {
          dist: '/mocked/project/api/dist',
        },
        web: {
          dist: '/mocked/project/web/dist',
          routes: '/mocked/project/web/Routes.tsx',
        },
      }
    },
    getConfig: () => {
      return {
        web: {
          bundler: 'webpack',
        },
      }
    },
  }
})

import { Listr } from 'listr2'
import { vi, afterEach, test, expect } from 'vitest'

vi.mock('listr2')

// Make sure prerender doesn't get triggered
vi.mock('execa', () => ({
  default: vi.fn((cmd, params) => ({
    cmd,
    params,
  })),
}))

import { handler } from '../build'

afterEach(() => {
  vi.clearAllMocks()
})

test('the build tasks are in the correct sequence', async () => {
  await handler({})
  expect(Listr.mock.calls[0][0].map((x) => x.title)).toMatchInlineSnapshot(`
    [
      "Generating Prisma Client...",
      "Verifying graphql schema...",
      "Building API...",
      "Cleaning Web...",
      "Building Web...",
    ]
  `)
})

vi.mock('@redwoodjs/prerender/detection', () => {
  return { detectPrerenderRoutes: () => [] }
})

test('Should run prerender for web', async () => {
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

  await handler({ side: ['web'], prerender: true })
  expect(Listr.mock.calls[0][0].map((x) => x.title)).toMatchInlineSnapshot(`
    [
      "Cleaning Web...",
      "Building Web...",
    ]
  `)

  // Run prerendering task, but expect warning,
  // because `detectPrerenderRoutes` is empty.
  expect(consoleSpy.mock.calls[0][0]).toBe('Starting prerendering...')
  expect(consoleSpy.mock.calls[1][0]).toMatch(
    /You have not marked any routes to "prerender"/,
  )
})
