import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Modal } from 'react-bootstrap';
import Layout from '../components/Layout';
import ClientFormModal from '../components/ClientFormModal';
import { categoryApi, clientApi, productApi, purchaseApi } from '../api/services';
import { DISCOUNT_OPTIONS, computeSaleTotal } from '../utils/discount';

const staffClients = (clients) => clients.filter((c) => c.clientType === 'STAFF');
const externeClients = (clients) => clients.filter((c) => c.clientType === 'EXTERNE');

export default function Purchases() {
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    clientType: '',
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

  const reloadClients = () =>
    clientApi.getAll(0, 500).then((res) => setClients(res.data.content));

  useEffect(() => {
    Promise.all([
      reloadClients(),
      categoryApi.getAll().then((res) => setCategories(res.data)),
      productApi.getAll(0, 500).then((res) => setProducts(res.data.content)),
    ]);
  }, []);

  const validateCurrentStep = () => {
    const errors = {};
    if (currentStep === 1 && !form.clientType) errors.clientType = 'Client type is required';
    if (currentStep === 2 && !form.clientId) errors.clientId = 'Client name is required';
    if (currentStep === 3 && !form.categoryId) errors.categoryId = 'Category is required';
    if (currentStep === 4 && !form.productId) errors.productId = 'Product is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSelect = (stepUpdates) => {
    setForm({ ...form, ...stepUpdates });
    setFormErrors({});
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    setError('');
    setSuccess('');
    try {
      await purchaseApi.create({
        clientId: Number(form.clientId),
        productId: Number(form.productId),
        discountPercent: Number(form.discountPercent),
      });
      setSuccess('Sale recorded successfully!');
      setForm({ clientType: '', clientId: '', categoryId: '', productId: '', discountPercent: 0 });
      setCurrentStep(1);
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 1500);
      productApi.getAll(0, 500).then((res) => setProducts(res.data.content));
    } catch (err) {
      setError(err.message || 'Failed to create purchase');
    }
  };

  const handleClientCreated = (client) => {
    setClients((prev) => [...prev, client]);
    setForm((f) => ({ ...f, clientType: client.clientType, clientId: String(client.id) }));
  };

  const openModal = () => {
    setForm({ clientType: '', clientId: '', categoryId: '', productId: '', discountPercent: 0 });
    setCurrentStep(1);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  return (
    <Layout title="Sales / Purchases">
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Button 
          variant="success" 
          size="lg" 
          onClick={openModal}
          style={{ padding: '20px 40px', fontSize: '1.5rem' }}
        >
          Record a Sell
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New Sale - Step {currentStep}/5</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          {currentStep === 1 && (
            <Form.Group>
              <Form.Label>Client Type</Form.Label>
              <div className="d-flex gap-3">
                <Button
                  variant={form.clientType === 'STAFF' ? 'primary' : 'outline-primary'}
                  className="flex-fill py-3"
                  onClick={() => handleSelect({ clientType: 'STAFF', clientId: '' })}
                >
                  Staff
                </Button>
                <Button
                  variant={form.clientType === 'EXTERNE' ? 'primary' : 'outline-primary'}
                  className="flex-fill py-3"
                  onClick={() => handleSelect({ clientType: 'EXTERNE', clientId: '' })}
                >
                  Externe
                </Button>
              </div>
              {formErrors.clientType && <div className="text-danger mt-2">{formErrors.clientType}</div>}
            </Form.Group>
          )}

          {currentStep === 2 && (
            <Form.Group>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label>Client Name</Form.Label>
                <Button
                  size="sm"
                  variant="outline-primary"
                  type="button"
                  onClick={() => setShowClientModal(true)}
                >
                  + New client
                </Button>
              </div>
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {form.clientType === 'STAFF' && staffClients(clients).map((c) => (
                  <Button
                    key={c.id}
                    variant={form.clientId === String(c.id) ? 'primary' : 'outline-secondary'}
                    className="text-start py-2"
                    onClick={() => handleSelect({ clientId: String(c.id) })}
                  >
                    {c.fullName}
                  </Button>
                ))}
                {form.clientType === 'EXTERNE' && externeClients(clients).map((c) => (
                  <Button
                    key={c.id}
                    variant={form.clientId === String(c.id) ? 'primary' : 'outline-secondary'}
                    className="text-start py-2"
                    onClick={() => handleSelect({ clientId: String(c.id) })}
                  >
                    {c.fullName}
                  </Button>
                ))}
              </div>
              {formErrors.clientId && <div className="text-danger mt-2">{formErrors.clientId}</div>}
            </Form.Group>
          )}

          {currentStep === 3 && (
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={form.categoryId === String(cat.id) ? 'primary' : 'outline-secondary'}
                    className="text-start py-2"
                    onClick={() => handleSelect({ categoryId: String(cat.id), productId: '' })}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
              {formErrors.categoryId && <div className="text-danger mt-2">{formErrors.categoryId}</div>}
            </Form.Group>
          )}

          {currentStep === 4 && (
            <Form.Group>
              <Form.Label>Product</Form.Label>
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {categoryProducts.map((p) => (
                  <Button
                    key={p.id}
                    variant={form.productId === String(p.id) ? 'primary' : 'outline-secondary'}
                    className="text-start py-2"
                    disabled={p.stock < 1}
                    onClick={() => handleSelect({ productId: String(p.id) })}
                  >
                    {p.name} — {Number(p.price).toFixed(2)} MAD
                    {p.stock < 1 ? ' (out of stock)' : ` (stock: ${p.stock})`}
                  </Button>
                ))}
              </div>
              {formErrors.productId && <div className="text-danger mt-2">{formErrors.productId}</div>}
            </Form.Group>
          )}

          {currentStep === 5 && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Discount</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {DISCOUNT_OPTIONS.map((d) => (
                    <Button
                      key={d}
                      variant={form.discountPercent === d ? 'primary' : 'outline-secondary'}
                      onClick={() => setForm({ ...form, discountPercent: d })}
                    >
                      {d === 0 ? 'No discount (0%)' : `${d}%`}
                    </Button>
                  ))}
                </div>
                {selectedProduct && form.discountPercent > 0 && (
                  <Form.Text className="text-muted d-block mt-2">
                    Original: {Number(selectedProduct.price).toFixed(2)} MAD
                  </Form.Text>
                )}
              </Form.Group>

              <div className="total-box mb-3 p-3 bg-light rounded">
                <span className="d-block mb-1">Total Price</span>
                <strong style={{ fontSize: '1.5rem' }}>{computedTotal} MAD</strong>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleBack} disabled={currentStep === 1}>
            Back
          </Button>
          {currentStep === 5 && (
            <Button 
              variant="success" 
              onClick={handleSubmit}
              disabled={!selectedProduct || selectedProduct.stock < 1}
            >
              Record Sale
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <ClientFormModal
        show={showClientModal}
        onHide={() => setShowClientModal(false)}
        onCreated={handleClientCreated}
      />
    </Layout>
  );
}
