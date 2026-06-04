import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Modal, Table } from 'react-bootstrap';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import PaginationControl from '../components/PaginationControl';
import { clientApi } from '../api/services';

const emptyForm = { firstName: '', lastName: '', phoneNumber: '', email: '', clientType: 'EXTERNE' };

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const loadClients = () => {
    setLoading(true);
    const request = search.trim()
      ? clientApi.search(search.trim(), page, 10)
      : clientApi.getAll(page, 10);

    request
      .then((res) => {
        setClients(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => setError(err.message || 'Failed to load clients'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadClients(); }, [page, search]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (client) => {
    setEditId(client.id);
    setForm({
      firstName: client.firstName,
      lastName: client.lastName,
      phoneNumber: client.phoneNumber,
      email: client.email || '',
      clientType: client.clientType || 'EXTERNE',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    if (!form.phoneNumber.trim()) errors.phoneNumber = 'Phone is required';
    const emailVal = form.email?.trim();
    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      errors.email = 'Invalid email format';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form, email: form.email?.trim() || null };
    try {
      if (editId) await clientApi.update(editId, payload);
      else await clientApi.create(payload);
      setShowModal(false);
      loadClients();
    } catch (err) {
      setFormErrors(err.validationErrors || { general: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try {
      await clientApi.delete(id);
      loadClients();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <Layout title="Clients">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <Form.Control
          style={{ maxWidth: 280 }}
          placeholder="Search client by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
        <Button variant="primary" onClick={openCreate}>+ Add Client</Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr
                      key={c.id}
                      className="client-row-clickable"
                      onClick={() => navigate(`/clients/${c.id}`)}
                    >
                      <td><strong>{c.fullName}</strong></td>
                      <td>
                        <span className={`badge ${c.clientType === 'STAFF' ? 'bg-primary' : 'bg-secondary'}`}>
                          {c.clientType === 'STAFF' ? 'Staff' : 'Externe'}
                        </span>
                      </td>
                      <td>{c.phoneNumber}</td>
                      <td>{c.email || '—'}</td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="primary"
                          className="me-2"
                          onClick={() => navigate(`/clients/${c.id}`)}
                        >
                          Purchases
                        </Button>
                        <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(c)}>Edit</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(c.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-muted py-4">No clients found</td></tr>
                  )}
                </tbody>
              </Table>
              <PaginationControl page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Edit Client' : 'New Client'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formErrors.general && <div className="alert alert-danger">{formErrors.general}</div>}
            <div className="row g-3">
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Type *</Form.Label>
                  <Form.Select
                    value={form.clientType}
                    onChange={(e) => setForm({ ...form, clientType: e.target.value })}
                  >
                    <option value="STAFF">Staff</option>
                    <option value="EXTERNE">Externe</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} isInvalid={!!formErrors.firstName} />
                  <Form.Control.Feedback type="invalid">{formErrors.firstName}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} isInvalid={!!formErrors.lastName} />
                  <Form.Control.Feedback type="invalid">{formErrors.lastName}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Phone *</Form.Label>
                  <Form.Control value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} isInvalid={!!formErrors.phoneNumber} />
                  <Form.Control.Feedback type="invalid">{formErrors.phoneNumber}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} isInvalid={!!formErrors.email} />
                  <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editId ? 'Update' : 'Create'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}
