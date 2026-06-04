import { useEffect, useState } from 'react';
import { Button, Card, Form, Modal, Table } from 'react-bootstrap';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import PaginationControl from '../components/PaginationControl';
import { categoryApi, productApi } from '../api/services';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
  categoryId: '',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const loadCategories = () =>
    categoryApi.getAll().then((res) => setCategories(res.data));

  const loadProducts = () => {
    setLoading(true);
    const request = filterCategory
      ? productApi.getByCategory(filterCategory, page, 10)
      : productApi.getAll(page, 10);

    request
      .then((res) => {
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => setError(err.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadProducts(); }, [page, filterCategory]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.price || Number(form.price) <= 0) errors.price = 'Valid price required';
    if (!form.categoryId) errors.categoryId = 'Category is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      price: Number(form.price),
      stock: 0, // default stock
      categoryId: Number(form.categoryId),
    };
    try {
      if (editId) await productApi.update(editId, payload);
      else await productApi.create(payload);
      setShowModal(false);
      loadProducts();
    } catch (err) {
      setFormErrors(err.validationErrors || { general: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productApi.delete(id);
      loadProducts();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <Layout title="Products">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <Form.Select
          style={{ maxWidth: 220 }}
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Form.Select>
        <Button variant="primary" onClick={openCreate}>+ Add Product</Button>
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
                    <th>Category</th>
                    <th>Price (MAD)</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.categoryName}</td>
                      <td>{Number(p.price).toFixed(2)}</td>
                      <td className="text-end">
                        <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(p)}>Edit</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={4} className="text-center text-muted py-4">No products found</td></tr>
                  )}
                </tbody>
              </Table>
              <PaginationControl page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Edit Product' : 'New Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formErrors.general && <div className="alert alert-danger">{formErrors.general}</div>}
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Name *</Form.Label>
                  <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} isInvalid={!!formErrors.name} />
                  <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Category *</Form.Label>
                  <Form.Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} isInvalid={!!formErrors.categoryId}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{formErrors.categoryId}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-12">
                <Form.Group>
                  <Form.Label>Price (MAD) *</Form.Label>
                  <Form.Control type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} isInvalid={!!formErrors.price} />
                  <Form.Control.Feedback type="invalid">{formErrors.price}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
