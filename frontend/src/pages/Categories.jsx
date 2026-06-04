import { useEffect, useState } from 'react';
import { Button, Card, Form, Modal, Table } from 'react-bootstrap';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { categoryApi } from '../api/services';

const emptyForm = { name: '', description: '' };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const loadCategories = () => {
    setLoading(true);
    categoryApi
      .getAll()
      .then((res) => setCategories(res.data))
      .catch((err) => setError(err.message || 'Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(loadCategories, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditId(cat.id);
    setForm({ name: cat.name, description: cat.description || '' });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editId) {
        await categoryApi.update(editId, form);
      } else {
        await categoryApi.create(form);
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setFormErrors(err.validationErrors || { general: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryApi.delete(id);
      loadCategories();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <Layout title="Categories">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">Manage product categories</p>
        <Button variant="primary" onClick={openCreate}>+ Add Category</Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Products</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td><strong>{cat.name}</strong></td>
                    <td>{cat.description || '—'}</td>
                    <td>{cat.productCount}</td>
                    <td className="text-end">
                      <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(cat)}>Edit</Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(cat.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-muted py-4">No categories yet</td></tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Edit Category' : 'New Category'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formErrors.general && <div className="alert alert-danger">{formErrors.general}</div>}
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                isInvalid={!!formErrors.name}
              />
              <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>
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
