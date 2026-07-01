import React from 'react'
import { Modal } from 'react-bootstrap'
import EmployeeForm from './EmployeeForm'

const EmployeeFormModal = ({ show, onHide, employee, onSuccess }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`bi ${employee ? 'bi-pencil-square' : 'bi-person-plus'} me-2`} />
          {employee ? 'Edit Employee' : 'Add New Employee'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EmployeeForm
          initialData={employee}
          onSuccess={() => {
            onSuccess()
            onHide()
          }}
          onCancel={onHide}
        />
      </Modal.Body>
    </Modal>
  )
}

export default EmployeeFormModal
