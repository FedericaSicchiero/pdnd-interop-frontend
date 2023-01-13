import {
  AttributeKey,
  CertifiedTenantAttribute,
  DeclaredTenantAttribute,
  VerifiedTenantAttribute,
} from './attribute.types'
import { DocumentRead } from './common.types'
import { EServiceState } from './eservice.types'

export type AgreementState =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'PENDING'
  | 'ARCHIVED'
  | 'DRAFT'
  | 'REJECTED'
  | 'MISSING_CERTIFIED_ATTRIBUTES'

type AgreementProducer = {
  name: string
  id: string
}
type AgreementConsumer = {
  name: string
  id: string
  attributes: Array<
    Record<
      AttributeKey,
      DeclaredTenantAttribute | CertifiedTenantAttribute | VerifiedTenantAttribute
    >
  >
}

type AgreementEService = {
  name: string
  id: string
  descriptorId: string
  version: string
  state: EServiceState
  activeDescriptor?: AgreementEService
}

export type AgreementAttribute = {
  id: string
  description: string
  name: string
  creationTime: string
}

export type AgreementSummary = {
  id: string
  state: AgreementState
  eservice: AgreementEService
  descriptorId: string
  consumer: AgreementConsumer
  producer: AgreementProducer
  verifiedAttributes: Array<AgreementAttribute>
  certifiedAttributes: Array<AgreementAttribute>
  declaredAttributes: Array<AgreementAttribute>
  suspendedByProducer?: boolean
  suspendedByConsumer?: boolean
  suspendedByPlatform?: boolean
  consumerNotes?: string
  consumerDocuments: Array<DocumentRead>
  createdAt: string
  updatedAt?: string
  rejectionReason?: string
}