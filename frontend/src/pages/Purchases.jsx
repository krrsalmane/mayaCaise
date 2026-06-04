import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import PaginationControl from '../components/PaginationControl';
import ClientFormModal from '../components/ClientFormModal';
import { categoryApi, clientApi, productApi, purchaseApi } from '../api/services';
import { DISCOUNT_OPTIONS, computeSaleTotal } from '../utils/discount';

const staffClients = (clients) => clients.filter((c) => c.clientType === 'STAFF');
const externeClients = (clients) => clients.filter((c) => c.clientType === 'EXTERNE');

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClientType, setSelectedClientType] = useState('');

  const [form, setForm] = useState({
    clientId: '',
    categoryId: '',
    productId: '',
    discountPercent: 0,
  });
  const [formErrors, setFormErrors] = useState({});

  const categoryProducts = useMemo(() => {
    if (!form.categoryId) return [];
    return products.filter((p) => p.categoryId === Number(form.categoryId));
  }, [products, form.categoryId]);

  const selectedProduct = products.find((p) => p.id === Number(form.productId));
  const computedTotal = selectedProduct
    ? computeSaleTotal(selectedProduct.price, form.discountPercent).toFixed(2)
    : '0.00';

  const loadPurchases = () => {
    setLoading(true);
    const request = startDate && endDate
      ? purchaseApi.getByDateRange(startDate, endDate, page, 10)
      : purchaseApi.getAll(page, 10);

    request
      .then((res) => {
        setPurchases(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => setError(err.message || 'Failed to load purchases'))
      .finally(() => setLoading(false));
  };

  const reloadClients = () =>
    clientApi.getAll(0, 500).then((res) => setClients(res.data.content));

  useEffect(() => {
    Promise.all([
      reloadClients(),
      categoryApi.getAll().then((res) => setCategories(res.data)),
      productApi.getAll(0, 500).then((res) => setProducts(res.data.content)),
    ]);
  }, []);

  useEffect(() => { loadPurchases(); }, [page, startDate, endDate]);

  const validate = () => {
    const errors = {};
    if (!form.clientId) errors.clientId = 'Client is required';
    if (!form.categoryId) errors.categoryId = 'Category is required';
    if (!form.productId) errors.productId = 'Product is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setSuccess('');
    try {
      await purchaseApi.create({
        clientId: Number(form.clientId),
        productId: Number(form.productId),
        discountPercent: Number(form.discountPercent),
      });
      setSuccess('Sale recorded successfully!');
      setForm({ clientId: form.clientId, categoryId: '', productId: '', discountPercent: 0 });
      loadPurchases();
      productApi.getAll(0, 500).then((res) => setProducts(res.data.content));
    } catch (err) {
      setError(err.message || 'Failed to create purchase');
    }
  };

  const handleClientCreated = (client) => {
    setClients((prev) => [...prev, client]);
    setSelectedClientType(client.clientType);
    setForm((f) => ({ ...f, clientId: String(client.id) }));
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  return (
    <Layout title="Sales / Purchases">
      <Row className="g-4">
        <Col lg={4}>
          <Card>
            <Card.Header>New Sale</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Form.Label className="mb-0">Client Type</Form.Label>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      type="button"
                      onClick={() => setShowClientModal(true)}
                    >
                      + New client
                    </Button>
                  </div>
                  <Form.Select
                    value={selectedClientType}
                    onChange={(e) => {
                      setSelectedClientType(e.target.value);
                      setForm({ ...form, clientId: '' });
                    }}
                    className="mb-3"
                  >
                    <option value="">Select Type</option>
                    <option value="STAFF">Staff</option>
                    <option value="EXTERNE">Externe</option>
                  </Form.Select>

                  <Form.Label className="mb-0">Client Name *</Form.Label>
                  <Form.Select
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                    isInvalid={!!formErrors.clientId}
                    disabled={!selectedClientType}
                  >
                    <option value="">Select client</option>
                    {selectedClientType === 'STAFF' && staffClients(clients).map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                    {selectedClientType === 'EXTERNE' && externeClients(clients).map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{formErrors.clientId}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm({ ...form, categoryId: e.target.value, productId: '' })
                    }
                    isInvalid={!!formErrors.categoryId}
                  >
                    <option value="">Choose category first</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{formErrors.categoryId}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Product *</Form.Label>
                  <Form.Select
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    disabled={!form.categoryId}
                    isInvalid={!!formErrors.productId}
                  >
                    <option value="">
                      {form.categoryId ? 'Select product' : 'Select category first'}
                    </option>
                    {categoryProducts.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.stock < 1}>
                        {p.name} — {Number(p.price).toFixed(2)} MAD
                        {p.stock < 1 ? ' (out of stock)' : ` (stock: ${p.stock})`}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{formErrors.productId}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Discount</Form.Label>
                  <Form.Select
                    value={form.discountPercent}
                    onChange={(e) =>
                      setForm({ ...form, discountPercent: Number(e.target.value) })
                    }
                  >
                    {DISCOUNT_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d === 0 ? 'No discount (0%)' : `${d}%`}
                      </option>
                    ))}
                  </Form.Select>
                  {selectedProduct && form.discountPercent > 0 && (
                    <Form.Text className="text-muted">
                      Original: {Number(selectedProduct.price).toFixed(2)} MAD
                    </Form.Text>
                  )}
                </Form.Group>

                <div className="total-box mb-3">
                  <span>Total Price</span>
                  <strong>{computedTotal} MAD</strong>
                </div>

                <Button type="submit" variant="success" className="w-100" disabled={!selectedProduct || selectedProduct.stock < 1}>
                  Record Sale
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <Card className="mb-3">
            <Card.Body>
              <Row className="g-2 align-items-end">
                <Col md={4}>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(0); }} />
                </Col>
                <Col md={4}>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(0); }} />
                </Col>
                <Col md={4}>
                  <Button variant="outline-secondary" className="w-100" onClick={clearFilters}>Clear dates</Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Purchase History</span>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Table responsive hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Product</th>
                        <th>Discount</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((p) => (
                        <tr key={p.id} className={p.paid ? 'purchase-row-paid' : ''}>
                          <td>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                          <td>
                            {p.clientName}
                            <small className="d-block text-muted">
                              {p.clientType === 'STAFF' ? 'Staff' : 'Externe'}
                            </small>
                          </td>
                          <td>{p.productName}</td>
                          <td>{p.discountPercent > 0 ? `-${p.discountPercent}%` : '—'}</td>
                          <td>{Number(p.totalPrice).toFixed(2)} MAD</td>
                        </tr>
                      ))}
                      {purchases.length === 0 && (
                        <tr><td colSpan={5} className="text-center text-muted py-4">No purchases found</td></tr>
                      )}
                    </tbody>
                  </Table>
                  <PaginationControl page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ClientFormModal
        show={showClientModal}
        onHide={() => setShowClientModal(false)}
        onCreated={handleClientCreated}
      />
    </Layout>
  );
}
