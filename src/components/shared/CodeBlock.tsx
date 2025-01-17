import { Box, Paper } from '@mui/material'
import React from 'react'
import { CopyToClipboardButton } from '@pagopa/mui-italia'

interface Props {
  error: unknown
}

const CodeBlock: React.FC<Props> = ({ error }) => {
  const stringifiedError =
    typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error)
  return (
    <Box>
      <Paper
        sx={{
          p: 2,
          mt: 4,
          position: 'relative',
          backgroundColor: 'background.default',
          whiteSpace: 'pre-wrap',
          maxHeight: 520,
          overflowY: 'auto',
          fontSize: 'small',
        }}
      >
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <CopyToClipboardButton value={stringifiedError} />
        </Box>
        <code>{stringifiedError}</code>
      </Paper>
    </Box>
  )
}

export default CodeBlock
