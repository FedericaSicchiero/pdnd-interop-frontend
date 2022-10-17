import React, { useContext } from 'react'
import { LangCode } from '../../types'
import { useHistory } from 'react-router-dom'
import { LangContext } from '../lib/context'
import { buildLocale } from '../lib/validation-config'
import { LANGUAGES, pagoPaLink } from '../lib/constants'
import { useTranslation } from 'react-i18next'
import { useJwt } from '../hooks/useJwt'
import { LoadingTranslations } from './Shared/LoadingTranslations'
import { FooterLinksType } from '@pagopa/mui-italia'
import { Typography } from '@mui/material'
import { TFunction } from 'i18next'
import { useRoute } from '../hooks/useRoute'
import { Footer } from './Footer'

type FooterLinksTypeMulti = Omit<FooterLinksType, 'label' | 'ariaLabel'> & { labelKey?: string }

function convertLinks(
  inputLinks: Array<FooterLinksTypeMulti>,
  t: TFunction
): Array<FooterLinksType> {
  return inputLinks.map((l) => {
    const link = { ...l }
    const label = t(`footer.links.${link.labelKey}.label`, { ns: 'pagopa' })
    const ariaLabel = t(`footer.links.${link.labelKey}.ariaLabel`, { ns: 'pagopa' })
    return { ...link, label, ariaLabel }
  })
}

export const FooterWrapper = () => {
  const history = useHistory()
  const { routes } = useRoute()
  const { lang, setLang } = useContext(LangContext)
  const { ready, t, i18n } = useTranslation(['common', 'pagopa'], { useSuspense: false })
  const { jwt } = useJwt()

  const links: Array<FooterLinksTypeMulti> = [
    {
      labelKey: 'privacy',
      onClick: () => {
        history.push(routes.TOS.PATH)
      },
      linkType: 'internal',
    },
    {
      labelKey: 'dataProtection',
      href: 'https://privacyportal-de.onetrust.com/webform/77f17844-04c3-4969-a11d-462ee77acbe1/9ab6533d-be4a-482e-929a-0d8d2ab29df8',
      linkType: 'external',
    },
    {
      labelKey: 'terms',
      onClick: () => {
        history.push(routes.TOS.PATH)
      },
      linkType: 'internal',
    },
    {
      labelKey: 'a11y',
      href: 'https://form.agid.gov.it/view/d96e090e-9d56-4d27-a70c-9a72186305b0/',
      linkType: 'external',
    },
  ]

  const onLanguageChanged = (newLang: LangCode) => {
    setLang(newLang)
    i18n.changeLanguage(newLang)
    buildLocale(t)
  }

  if (!ready) {
    return <LoadingTranslations />
  }

  const LegalInfo = (
    <Typography color="inherit" component="p" variant="caption">
      <Typography variant="inherit" component="span" fontWeight={700}>
        PagoPA S.p.A.
      </Typography>{' '}
      — società per azioni con socio unico - capitale sociale di euro 1,000,000 interamente versato
      - sede legale in Roma, Piazza Colonna 370,
      <br />
      CAP 00187 - n. di iscrizione a Registro Imprese di Roma, CF e P.IVA 15376371009
    </Typography>
  )

  console.log({ l: convertLinks(links, t) })

  return (
    <Footer
      loggedUser={Boolean(jwt)}
      companyLink={pagoPaLink}
      legalInfo={LegalInfo}
      postLoginLinks={convertLinks(links, t)}
      preLoginLinks={{
        aboutUs: { title: 'Chi siamo', links: [] },
        resources: { title: 'Risorse', links: [] },
        followUs: { title: 'Seguici su', links: [], socialLinks: [] },
      }}
      currentLangCode={lang}
      onLanguageChanged={onLanguageChanged}
      onExit={() => (href: string, linkType: string) => {
        if (linkType === 'internal') {
          history.push(href)
        } else {
          window.open(href, '_blank')
        }
      }}
      languages={LANGUAGES}
      hideProductsColumn={true}
    />
  )
}
