import React, { useContext } from 'react'
import { StyledIntro } from '../components/Shared/StyledIntro'
import { DialogContext } from '../lib/context'
import { StyledButton } from '../components/Shared/StyledButton'
import { Tab, Tabs } from '@mui/material'
import { Box } from '@mui/system'
import { ROUTES } from '../config/routes'
import { useActiveTab } from '../hooks/useActiveTab'
import { a11yProps, TabPanel } from '../components/TabPanel'
import { EServiceContentInfo } from '../components/Shared/EServiceContentInfo'
import { ActionProps, DecoratedPurpose, EServiceReadType } from '../../types'
import { TableWithLoader } from '../components/Shared/TableWithLoader'
import { mockPurposeList } from '../temp/mock-purpose'
import { formatThousands } from '../lib/number-utils'
import { StyledTableRow } from '../components/Shared/StyledTableRow'
import { decoratePurposeWithMostRecentVersion } from '../lib/purpose'
import { formatDateString } from '../lib/date-utils'
import { useFeedback } from '../hooks/useFeedback'
import { ActionMenu } from '../components/Shared/ActionMenu'
import { useLocation } from 'react-router-dom'
import {
  decorateEServiceWithActiveDescriptor,
  getEserviceAndDescriptorFromUrl,
} from '../lib/eservice-utils'
import { useAsyncFetch } from '../hooks/useAsyncFetch'
import { NotFound } from './NotFound'
import { StyledSkeleton } from '../components/Shared/StyledSkeleton'

export function EServiceEdit() {
  const { setDialog } = useContext(DialogContext)
  const { runFakeAction, runAction, forceRerenderCounter } = useFeedback()
  const { activeTab, updateActiveTab } = useActiveTab()

  const location = useLocation()
  const { eserviceId, descriptorId } = getEserviceAndDescriptorFromUrl(location)
  const { data, error } = useAsyncFetch<EServiceReadType>(
    {
      path: { endpoint: 'ESERVICE_GET_SINGLE', endpointParams: { eserviceId } },
    },
    {
      mapFn: decorateEServiceWithActiveDescriptor(descriptorId),
      loadingTextLabel: 'Stiamo caricando il tuo e-service',
      useEffectDeps: [forceRerenderCounter],
    }
  )

  const wrapUpdatePurposeExpectedApprovalDate = (id: string, approvalDate?: string) => () => {
    setDialog({ type: 'setPurposeExpectedApprovalDate', id, approvalDate, runAction })
  }

  const wrapActivatePurpose = (id: string) => () => {
    runFakeAction(`Attivazione finalità ${id}`)
  }

  const getAvailableActions = (item: DecoratedPurpose): Array<ActionProps> => {
    const actions = [
      {
        onClick: wrapUpdatePurposeExpectedApprovalDate(
          item.id,
          item.currentVersion.expectedApprovalDate
        ),
        label: 'Aggiorna data di approvazione',
      },
      {
        onClick: wrapActivatePurpose(item.id),
        label: 'Attiva',
      },
    ]
    return actions
  }

  if (!data) {
    return <StyledSkeleton />
  }

  if (error) {
    return <NotFound errorType="server-error" />
  }

  const headData = ['Nome finalità', 'Stima di carico', 'Data di completamento']

  // const purposes = (data?.subscriberPurpose || []).map(decoratePurposeWithMostRecentVersion) as Array<DecoratedPurpose>
  const purposes = mockPurposeList.map(
    decoratePurposeWithMostRecentVersion
  ) as Array<DecoratedPurpose>

  return (
    <React.Fragment>
      <StyledIntro sx={{ mb: 0 }}>{{ title: data.name }}</StyledIntro>

      <Tabs
        value={activeTab}
        onChange={updateActiveTab}
        aria-label="Due tab diverse per i dettagli dell'e-service e le stime di carico indicate dai fruitori"
        sx={{ my: 6 }}
        variant="fullWidth"
      >
        <Tab label="Dettagli dell'e-service" {...a11yProps(0)} />
        <Tab label="Stime di carico" {...a11yProps(1)} />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <React.Fragment>
          <EServiceContentInfo data={data} />

          <Box sx={{ display: 'flex', mt: 4 }}>
            <StyledButton variant="outlined" to={ROUTES.SUBSCRIBE_CATALOG_LIST.PATH}>
              Torna al catalogo
            </StyledButton>
          </Box>
        </React.Fragment>
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <StyledIntro variant="h2">{{ title: 'Finalità in attesa di completamento' }}</StyledIntro>

        <TableWithLoader
          loadingText={null}
          headData={headData}
          noDataLabel="Nessuna finalità da evadere"
        >
          {Boolean(purposes.length > 0) &&
            purposes.map((item, i) => {
              return (
                <StyledTableRow
                  key={i}
                  cellData={[
                    { label: item.name },
                    { label: formatThousands(item.currentVersion.dailyCalls) },
                    {
                      label: item.currentVersion.expectedApprovalDate
                        ? formatDateString(item.currentVersion.expectedApprovalDate)
                        : 'In attesa di presa in carico',
                    },
                  ]}
                >
                  <ActionMenu actions={getAvailableActions(item)} />
                </StyledTableRow>
              )
            })}
        </TableWithLoader>
      </TabPanel>
    </React.Fragment>
  )
}
