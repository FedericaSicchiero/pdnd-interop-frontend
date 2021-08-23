import React from 'react'
import { Form, FloatingLabel } from 'react-bootstrap'
import { StyledInputTextType } from '../../types'

type StyledInputTextProps = {
  type?: StyledInputTextType
  id: string
  label: string
  placeholder: string
  readOnly?: boolean
  value?: string
  onChange?: any
}

export function StyledInputText({
  type = 'text',
  id,
  label,
  placeholder,
  readOnly = false,
  value,
  onChange,
}: StyledInputTextProps) {
  return (
    <FloatingLabel controlId={id} label={label} className="mb-3">
      <Form.Control
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    </FloatingLabel>
  )
}
