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
          className="record-sell-button"
          onClick={openModal}
        >
          Record a Sell
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New Sale - Step {currentStep}/5</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="step-indicator">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`step-dot ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>
          <div className="text-center mb-4">
            <span className="step-label">Step {currentStep} of 5</span>
          </div>

          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          {currentStep === 1 && (
            <Form.Group>
              <Form.Label className="mb-3 fw-semibold">Client Type</Form.Label>
              <div className="d-flex gap-3">
                <Button
                  className={`flex-fill py-3 option-button ${form.clientType === 'STAFF' ? 'selected' : ''}`}
                  onClick={() => handleSelect({ clientType: 'STAFF', clientId: '' })}
                >
                  Staff
                </Button>
                <Button
                  className={`flex-fill py-3 option-button ${form.clientType === 'EXTERNE' ? 'selected' : ''}`}
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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Label className="fw-semibold mb-0">Client Name</Form.Label>
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
                    className={`text-start py-2 option-button ${form.clientId === String(c.id) ? 'selected' : ''}`}
                    onClick={() => handleSelect({ clientId: String(c.id) })}
                  >
                    {c.fullName}
                  </Button>
                ))}
                {form.clientType === 'EXTERNE' && externeClients(clients).map((c) => (
                  <Button
                    key={c.id}
                    className={`text-start py-2 option-button ${form.clientId === String(c.id) ? 'selected' : ''}`}
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
              <Form.Label className="mb-3 fw-semibold">Category</Form.Label>
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    className={`text-start py-2 option-button ${form.categoryId === String(cat.id) ? 'selected' : ''}`}
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
              <Form.Label className="mb-3 fw-semibold">Product</Form.Label>
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {categoryProducts.map((p) => (
                  <Button
                    key={p.id}
                    className={`text-start py-2 option-button ${form.productId === String(p.id) ? 'selected' : ''}`}
                    onClick={() => handleSelect({ productId: String(p.id) })}
                  >
                    {p.name} — {Number(p.price).toFixed(2)} MAD
                  </Button>
                ))}
              </div>
              {formErrors.productId && <div className="text-danger mt-2">{formErrors.productId}</div>}
            </Form.Group>
          )}

          {currentStep === 5 && (
            <>
              <Form.Group className="mb-4">
                <Form.Label className="mb-3 fw-semibold">Discount</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {DISCOUNT_OPTIONS.map((d) => (
                    <Button
                      key={d}
                      className={`option-button ${form.discountPercent === d ? 'selected' : ''}`}
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

              <div className="total-box mb-3 p-4 bg-light rounded">
                <span className="d-block mb-2 fw-semibold text-muted">Total Price</span>
                <strong style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>{computedTotal} MAD</strong>
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
              className="record-sell-button"
              onClick={handleSubmit}
              disabled={!selectedProduct}
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
