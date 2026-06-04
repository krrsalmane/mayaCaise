import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { clientApi } from '../api/services';

const emptyForm = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  clientType: 'EXTERNE',
};

export default function ClientFormModal({ show, onHide, onCreated, defaultType = 'EXTERNE' }) {
  const [form, setForm] = useState({ ...emptyForm, clientType: defaultType });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const resetAndClose = () => {
    setForm({ ...emptyForm, clientType: defaultType });
    setFormErrors({});
    onHide();
  };

  const validate = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = 'Required';
    if (!form.lastName.trim()) errors.lastName = 'Required';
    if (!form.phoneNumber.trim()) errors.phoneNumber = 'Required';
    const emailVal = form.email?.trim();
    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      errors.email = 'Invalid email';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await clientApi.create({
        ...form,
        email: form.email?.trim() || null,
        clientType: form.clientType,
      });
      onCreated?.(res.data);
      resetAndClose();
    } catch (err) {
      setFormErrors(err.validationErrors || { general: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={resetAndClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>New Client</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {formErrors.general && <div className="alert alert-danger">{formErrors.general}</div>}
          <Form.Group className="mb-3">
            <Form.Label>Type *</Form.Label>
            <Form.Select
              value={form.clientType}
              onChange={(e) => setForm({ ...form, clientType: e.target.value })}
            >
              <option value="STAFF">Staff</option>
              <option value="EXTERNE">Externe</option>
            </Form.Select>
          </Form.Group>
          <div className="row g-2">
            <div className="col-6">
              <Form.Group>
                <Form.Label>First name *</Form.Label>
                <Form.Control
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  isInvalid={!!formErrors.firstName}
                />
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group>
                <Form.Label>Last name *</Form.Label>
                <Form.Control
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  isInvalid={!!formErrors.lastName}
                />
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group>
                <Form.Label>Phone *</Form.Label>
                <Form.Control
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  isInvalid={!!formErrors.phoneNumber}
                />
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Form.Group>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetAndClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Create & Select'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
