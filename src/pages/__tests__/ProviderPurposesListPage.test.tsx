import React from 'react'
import { ProviderPurposesListPage } from '../ProviderPurposesListPage'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { BACKEND_FOR_FRONTEND_URL } from '@/config/env'
import { waitFor } from '@testing-library/react'
import { renderWithApplicationContext } from '@/utils/testing.utils'
import { vi } from 'vitest'
import * as useJwtImport from '@/hooks/useJwt'
import { createMockPurpose } from '__mocks__/data/purpose.mocks'

const getPurposesListUrl = `${BACKEND_FOR_FRONTEND_URL}/purposes`
vi.spyOn(useJwtImport, 'useJwt').mockImplementation(
  () =>
    ({
      jwt: {
        organizationId: 'organizationId',
      },
    } as ReturnType<typeof useJwtImport.useJwt>)
)

const emptyHandler = rest.get(getPurposesListUrl, (req, res, ctx) => {
  return res(ctx.json({ results: [], pagination: { totalCount: 0 } }))
})

const fullHandler = rest.get(getPurposesListUrl, (req, res, ctx) => {
  return res(
    ctx.json({
      results: [
        createMockPurpose({ id: '1', title: 'Purpose 1' }),
        createMockPurpose({ id: '2', title: 'Purpose 2' }),
        createMockPurpose({ id: '2', title: 'Purpose 3' }),
      ],
      pagination: { totalCount: 3 },
    })
  )
})

describe('ProviderPurposesList page', () => {
  it('should match the snapshot on loading/empty state', async () => {
    const server = setupServer(emptyHandler)

    server.listen()
    const screen = renderWithApplicationContext(<ProviderPurposesListPage />, {
      withReactQueryContext: true,
      withRouterContext: true,
    })

    expect(screen.baseElement).toMatchSnapshot('loading state')
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.baseElement).toMatchSnapshot('empty state')

    server.resetHandlers()
    server.close()
  })

  it('should match the snapshot on full state', async () => {
    const server = setupServer(fullHandler)

    server.listen()
    const screen = renderWithApplicationContext(<ProviderPurposesListPage />, {
      withReactQueryContext: true,
      withRouterContext: true,
    })

    await waitFor(() => expect(screen.getByText('Purpose 1')).toBeInTheDocument())

    expect(screen.baseElement).toMatchSnapshot()

    server.resetHandlers()
    server.close()
  })
})
