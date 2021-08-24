import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { Party } from '../../types'
import { WhiteBackground } from '../components/WhiteBackground'
import { withLogin } from '../components/withLogin'
import { ROUTES } from '../lib/constants'
import { PartyContext } from '../lib/context'
import { Row, Col, Button } from 'react-bootstrap'
import { StyledInputRadioGroup } from '../components/StyledInputRadioGroup'

function ChoosePartyComponent() {
  const { setParty, party, availableParties } = useContext(PartyContext)
  const history = useHistory()

  const buildUpdateActiveParty = (newParty: Party) => (_: React.SyntheticEvent) => {
    setParty(newParty)
  }

  const confirmChoice = () => {
    history.push(ROUTES.PROVIDE.PATH)
  }

  const goToOnboarding = () => {
    history.push(ROUTES.ONBOARDING.PATH)
  }

  return (
    <WhiteBackground verticallyCentered={true}>
      <Row className="text-center mb-5">
        <h2>Seleziona l’ente con il quale procedere</h2>
        <p className="mx-auto" style={{ maxWidth: 462 }}>
          Se l’ente con il quale vuoi fare accesso non è ancora registrato alla piattaforma, non
          comparirà nell’elenco. Puoi aggiungerlo cliccando su <em>registra nuovo ente</em>
        </p>
      </Row>
      <Row className="d-flex align-items-center">
        <Col>
          <h3>Selezione ente</h3>
          <p style={{ maxWidth: 320 }}>
            Nota: potrai modificarlo successivamente anche senza effettuare logout
          </p>
          <div>
            <StyledInputRadioGroup
              id="istituzioni"
              groupLabel="Selezione ente"
              options={availableParties.map((p) => {
                return {
                  label: `${p.description}${
                    p.status === 'Pending' ? ': registrazione pending' : ''
                  }`,
                  disabled: p.status === 'Pending',
                  onChange: buildUpdateActiveParty(p),
                  value: p.institutionId,
                }
              })}
              currentValue={party?.institutionId}
            />

            <Button className="mt-3" variant="primary" onClick={confirmChoice} disabled={!party}>
              prosegui
            </Button>
          </div>
        </Col>
        <Col className="text-center">
          <p>oppure</p>
          <Button variant="primary" onClick={goToOnboarding}>
            registra nuovo ente
          </Button>
        </Col>
      </Row>
    </WhiteBackground>
  )
}

export const ChooseParty = withLogin(ChoosePartyComponent)
