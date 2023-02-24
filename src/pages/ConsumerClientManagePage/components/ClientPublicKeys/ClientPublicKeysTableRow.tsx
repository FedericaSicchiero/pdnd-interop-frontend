import { ClientQueries } from '@/api/client'
import { ActionMenu, ActionMenuSkeleton } from '@/components/shared/ActionMenu'
import { TableRow } from '@/components/shared/Table'
import { RouterLink } from '@/router'
import type { PublicKey } from '@/types/key.types'
import { formatDateString } from '@/utils/format.utils'
import { Box, Skeleton, Tooltip } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useClientKind } from '@/hooks/useClientKind'
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred'
import { isKeyOrphan } from '@/utils/key.utils'
import { ButtonSkeleton } from '@/components/shared/MUISkeletons'
import useGetKeyActions from '@/hooks/useGetKeyActions'

interface ClientPublicKeysTableRowProps {
  publicKey: PublicKey
  clientId: string
}

export const ClientPublicKeysTableRow: React.FC<ClientPublicKeysTableRowProps> = ({
  publicKey,
  clientId,
}) => {
  const { t: tCommon } = useTranslation('common')
  const { t } = useTranslation('key')
  const clientKind = useClientKind()
  const { data: operators = [] } = ClientQueries.useGetOperatorsList(clientId)
  const prefetchKey = ClientQueries.usePrefetchSingleKey()

  const kid = publicKey.key.kid

  const { actions } = useGetKeyActions(clientId, kid)

  const inspectRouteKey =
    clientKind === 'API' ? 'SUBSCRIBE_INTEROP_M2M_CLIENT_KEY_EDIT' : 'SUBSCRIBE_CLIENT_KEY_EDIT'

  const handlePrefetchKey = () => {
    prefetchKey(clientId, kid)
  }

  const isOrphan = isKeyOrphan(publicKey, operators)
  const color = isOrphan ? 'error' : 'primary'

  return (
    <TableRow
      cellData={[
        {
          label: publicKey.name,
          tooltip: isOrphan ? (
            <Tooltip title={t('tableKey.operatorDeletedWarning.message')}>
              <ReportGmailerrorredIcon sx={{ ml: 0.75, fontSize: 16 }} color={color} />
            </Tooltip>
          ) : undefined,
        },
        { label: `${publicKey.operator.name} ${publicKey.operator.familyName}` },
        { label: formatDateString(publicKey.createdAt) },
      ]}
    >
      <RouterLink
        as="button"
        to={inspectRouteKey}
        params={{ clientId, kid }}
        variant="outlined"
        size="small"
        onPointerEnter={handlePrefetchKey}
        onFocusVisible={handlePrefetchKey}
      >
        {tCommon('actions.inspect')}
      </RouterLink>

      <Box component="span" sx={{ ml: 2, display: 'inline-block' }}>
        <ActionMenu actions={actions} iconColor={color} />
      </Box>
    </TableRow>
  )
}

export const ClientPublicKeysTableRowSkeleton: React.FC = () => {
  return (
    <TableRow
      cellData={[
        { label: <Skeleton width={120} /> },
        { label: <Skeleton width={120} /> },
        { label: <Skeleton width={120} /> },
      ]}
    >
      <ButtonSkeleton size="small" width={100} />
      <ActionMenuSkeleton />
    </TableRow>
  )
}
