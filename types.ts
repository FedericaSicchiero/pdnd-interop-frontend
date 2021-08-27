import { AxiosRequestConfig } from 'axios'
import React from 'react'
import { AGREEMENT_STATUS, API, ESERVICE_STATUS } from './src/lib/constants'

export type UserRole = 'Manager' | 'Delegate'

export type User = {
  name: string
  surname: string
  taxCode: string
  email?: string
  role?: UserRole
}

export type Party = {
  status: 'Pending'
  description: string
  institutionId: string
  digitalAddress: string
  partyId?: string
}

export type Provider = 'provider'
export type Subscriber = 'subscriber'
export type ProviderOrSubscriber = Provider | Subscriber

export type ApiEndpointKey = keyof typeof API
export type RoutesObject = { [key: string]: RouteConfig }
export type RouteConfig = {
  PATH: string
  LABEL: string
  EXACT?: boolean
  SUBROUTES?: RoutesObject
  COMPONENT?: React.FunctionComponent<any>
}

export type StepperStepComponentProps = {
  forward?: any
  back?: () => void
  updateFormData?: React.Dispatch<React.SetStateAction<any>>
}

export type StepperStep = {
  label: string
  Component: React.FunctionComponent<StepperStepComponentProps>
}

export type IPAParty = {
  description: string
  digitalAddress: string
  id: string
  managerName: string
  managerSurname: string
  o: string
  ou: string
}

export type SingleLogType = 'Router' | 'API'
export type DisplayLogsType = null | 'all' | SingleLogType[]

export type Image = { src: string; alt: string }
export type Outcome = { title: string; description: JSX.Element[]; img: Image }
export type Outcomes = { [key: number]: Outcome }

export type EServiceStatus = keyof typeof ESERVICE_STATUS
export type EServiceStatusLabel = Record<EServiceStatus, string>

export type EServiceSummary = {
  id: string
  name: string
  version: number
  status: EServiceStatus
}

export type StyledInputTextType = 'text' | 'email'

export type EServiceDocumentKind = 'interface' | 'document'
export type EServiceDocumentType = {
  kind: EServiceDocumentKind
  description?: string
  doc: any // File
}

export type EServiceDescriptor = {
  id: string
  status: EServiceStatus
  docs: EServiceDocumentType[]
}

export type EServiceDataType = {
  name?: string
  version?: number
  audience: string[]
  description?: string
  // serviceId?: string
  technology: 'REST' | 'SOAP'
  pop: boolean
  voucherLifespan: number
}

export type EServiceDataTypeKeys =
  | 'name'
  | 'version'
  | 'audience'
  | 'technology'
  | 'pop'
  | 'voucherLifespan'
  | 'description'

export type BackendAttribute =
  | {
      simple: string
    }
  | {
      group: string[]
    }

export type BackendFormattedAttributes = {
  [key in AttributeKey]: BackendAttribute[]
}

export type AttributeFromCatalog = {
  certified: boolean
  creationTime: string
  description: string
  id: string
  name: string
  code?: string
  origin?: 'IPA'

  verificationRequired?: boolean // This is a TEMP until we understand where to put it in the data model
}
export type AttributeGroup = {
  group: AttributeFromCatalog[]
  verificationRequired: boolean
}
export type AttributeKey = 'certified' | 'verified' | 'declared'
export type Attributes = {
  [key in AttributeKey]: AttributeGroup[]
}

export type AttributeModalTemplate = 'add' | 'create'

export type Endpoint = {
  endpoint: ApiEndpointKey
  endpointParams?: any
}

export type ToastContent = {
  title: string
  description: string
  onClose?: VoidCallback
}

export type RequestConfig = {
  path: Endpoint
  config: AxiosRequestConfig
}

export type AgreementStatus = keyof typeof AGREEMENT_STATUS

export type AgreementVerifiableAttribute = {
  id: string
  verificationDate: string
  verified: boolean

  // Backend doesn't send it for now
  name?: string
}

export type AgreementSummary = {
  id: string
  status: AgreementStatus
  eserviceId: string
  consumerId: string
  producerId: string
  verifiedAttributes: AgreementVerifiableAttribute[]

  // Backend doesn't send them for now
  producerName?: string
  consumerName?: string
  eserviceName?: string
  eserviceVersion?: string
}

export type VoidCallback = () => void
