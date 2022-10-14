import React from 'react'
import {
  DialogAddClientsProps,
  DialogAddSecurityOperatorKeyProps,
  DialogAddSecurityOperatorProps,
  DialogAskExtensionProps,
  DialogAttributeDetailsProps,
  DialogBasicProps,
  DialogExistingAttributeProps,
  DialogNewAttributeProps,
  DialogProps,
  DialogRejectAgreementProps,
  DialogSessionExpiredProps,
  DialogSetPurposeExpectedApprovalDateProps,
  DialogUpdatePurposeDailyCallsProps,
} from '../../../types'
import { StyledDialogExtension } from './StyledDialogExtension'
import { StyledDialogBasic } from './StyledDialogBasic'
import { StyledDialogAddSecurityOperatorKey } from './StyledDialogAddSecurityOperatorKey'
import { StyledDialogExistingAttribute } from './StyledDialogExistingAttribute'
import { StyledDialogNewAttribute } from './StyledDialogNewAttribute'
import { StyledDialogAddSecurityOperator } from './StyledDialogAddSecurityOperator'
import { StyledDialogAddClients } from './StyledDialogAddClients'
import { StyledDialogUpdatePurposeDailyCalls } from './StyledDialogUpdatePurposeDailyCalls'
import { StyledDialogSetPurposeExpectedApprovalDate } from './StyledDialogSetPurposeExpectedApprovalDate'
import { StyledDialogSessionExpired } from './StyledDialogSessionExpired'
import { StyledDialogAttributeDetails } from './StyledDialogAttributeDetails'
import { StyledDialogRejectAgreement } from './StyledDialogRejectAgreement'

function match<T>(
  onBasic: (props: DialogBasicProps) => T,
  onAskExtension: (props: DialogAskExtensionProps) => T,
  onAddSecurityOperatorKey: (props: DialogAddSecurityOperatorKeyProps) => T,
  onExistingAttribute: (props: DialogExistingAttributeProps) => T,
  onNewAttribute: (props: DialogNewAttributeProps) => T,
  onShowAttributeDetails: (props: DialogAttributeDetailsProps) => T,
  onAddSecurityOperator: (props: DialogAddSecurityOperatorProps) => T,
  onAddClients: (props: DialogAddClientsProps) => T,
  onUpdatePurposeDailyCalls: (props: DialogUpdatePurposeDailyCallsProps) => T,
  onSetPurposeExpectedApprovalDate: (props: DialogSetPurposeExpectedApprovalDateProps) => T,
  onRejectAgreement: (props: DialogRejectAgreementProps) => T,
  onSessionExpired: (props: DialogSessionExpiredProps) => T
) {
  return (props: DialogProps) => {
    switch (props.type) {
      case 'basic':
        return onBasic(props)
      case 'askExtension':
        return onAskExtension(props)
      case 'addSecurityOperatorKey':
        return onAddSecurityOperatorKey(props)
      case 'addExistingAttribute':
        return onExistingAttribute(props)
      case 'createNewAttribute':
        return onNewAttribute(props)
      case 'showAttributeDetails':
        return onShowAttributeDetails(props)
      case 'addSecurityOperator':
        return onAddSecurityOperator(props)
      case 'addClients':
        return onAddClients(props)
      case 'updatePurposeDailyCalls':
        return onUpdatePurposeDailyCalls(props)
      case 'setPurposeExpectedApprovalDate':
        return onSetPurposeExpectedApprovalDate(props)
      case 'rejectAgreement':
        return onRejectAgreement(props)
      case 'sessionExpired':
        return onSessionExpired(props)
    }
  }
}

export const StyledDialog = match(
  (props) => <StyledDialogBasic {...props} />,
  (props) => <StyledDialogExtension {...props} />,
  (props) => <StyledDialogAddSecurityOperatorKey {...props} />,
  (props) => <StyledDialogExistingAttribute {...props} />,
  (props) => <StyledDialogNewAttribute {...props} />,
  (props) => <StyledDialogAttributeDetails {...props} />,
  (props) => <StyledDialogAddSecurityOperator {...props} />,
  (props) => <StyledDialogAddClients {...props} />,
  (props) => <StyledDialogUpdatePurposeDailyCalls {...props} />,
  (props) => <StyledDialogSetPurposeExpectedApprovalDate {...props} />,
  (props) => <StyledDialogRejectAgreement {...props} />,
  (props) => <StyledDialogSessionExpired {...props} />
)
