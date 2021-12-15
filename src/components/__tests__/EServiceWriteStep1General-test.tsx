import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { EServiceWriteStep1General } from '../EServiceWriteStep1General'
import { EServiceReadType } from '../../../types'

describe('Rendering tests', () => {
  it('Renders without crashing', () => {
    const back = jest.fn()
    const forward = jest.fn()
    const data = {}

    const div = document.createElement('div')
    ReactDOM.render(
      <BrowserRouter>
        <EServiceWriteStep1General forward={forward} back={back} data={data} activeStep={0} />
      </BrowserRouter>,
      div
    )
  })

  it('Should render form input fields', () => {
    const back = jest.fn()
    const forward = jest.fn()
    const data = {}

    render(
      <BrowserRouter>
        <EServiceWriteStep1General forward={forward} back={back} data={data} activeStep={0} />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { name: 'Caratterizzazione e-service' })).toBeInTheDocument()

    expect(
      screen.getByRole('textbox', { name: "Nome dell'eservice (richiesto)" })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('textbox', { name: "Descrizione dell'e-service (richiesto)" })
    ).toBeInTheDocument()

    expect(screen.getByLabelText('REST')).toBeInTheDocument()
    expect(screen.getByLabelText('SOAP')).toBeInTheDocument()

    expect(
      screen.getByRole('checkbox', { name: 'Proof of Possession (richiesto)' })
    ).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Attributi' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Salva bozza e prosegui' })).toBeInTheDocument()
  })

  it('Should render attributes', () => {
    const back = jest.fn()
    const forward = jest.fn()
    const data = {}
    const fetchedDataMaybe: EServiceReadType = {
      producer: {
        id: 'djofsi-sdfjdsi-djsfs',
        name: 'Comune di Bologna',
      },
      name: 'Nome e-service',
      description: 'Descrizione e-service',
      technology: 'REST',
      id: 'sdjof-sdfjdspof-dsfdsjf',
      status: 'published',
      descriptors: [],
      attributes: {
        verified: [],
        declared: [],
        certified: [
          {
            single: {
              id: 'dsdsld-dsdlds-lsdasdas',
              explicitAttributeVerification: false,
              verified: false,
              origin: 'dfkdsfk',
              code: 'dfjdso',
              name: 'Attributo 1',
              description: 'Descrizione attributo 1',
            },
          },
        ],
      },
    }

    render(
      <BrowserRouter>
        <EServiceWriteStep1General
          forward={forward}
          back={back}
          data={data}
          activeStep={0}
          fetchedDataMaybe={fetchedDataMaybe}
        />
      </BrowserRouter>
    )

    // Certified attribute displays 1 item. See if title matches
    expect(screen.getByText('Attributo 1')).toBeInTheDocument()
    // Verified and declared attributes both currently display a "no attribute" message
    expect(screen.queryAllByText('Nessun attributo presente').length).toBe(2)
  })
})