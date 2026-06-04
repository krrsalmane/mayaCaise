import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Col, Row, Table } from 'react-bootstrap';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { clientApi, purchaseApi } from '../api/services';
import { downloadTicketPdf } from '../utils/ticketPdf';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      clientApi.getById(id),
      purchaseApi.getByClient(id, 0, 500, 'purchaseDate,desc'),
    ])
      .then(([clientRes, purchasesRes]) => {
        setClient(clientRes.data);
        setPurchases(purchasesRes.data.content);
      })
      .catch((err) => setError(err.message || 'Failed to load client purchases'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const totals = useMemo(() => {
    const all = purchases.reduce((sum, p) => sum + Number(p.totalPrice), 0);
    const paid = purchases
      .filter((p) => p.paid)
      .reduce((sum, p) => sum + Number(p.totalPrice), 0);
    const unpaid = all - paid;
    return { all, paid, unpaid, count: purchases.length };
  }, [purchases]);

  const handlePaymentChange = async (purchaseId, paid) => {
    setUpdatingId(purchaseId);
    setError('');
    try {
      const res = await purchaseApi.updatePaid(purchaseId, paid);
      setPurchases((prev) =>
        prev.map((p) => (p.id === purchaseId ? { ...p, paid: res.data.paid } : p))
      );
    } catch (err) {
      setError(err.message || 'Failed to update payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadTicket = () => {
    if (!client || purchases.length === 0) return;
    downloadTicketPdf({
      title: 'Releve client',
      client,
      purchases,
      filename: `ticket_${client.fullName.replace(/\s+/g, '_')}.pdf`,
    });
  };

  if (loading) {
    return (
      <Layout title="Client Purchases">
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout title="Client Purchases">
        <Alert variant="danger">Client not found</Alert>
        <Button variant="link" onClick={() => navigate('/clients')}>← Back to clients</Button>
      </Layout>
    );
  }

  const typeLabel = client.clientType === 'STAFF' ? 'Staff' : 'Externe';

  return (
    <Layout title={`${client.fullName} — Purchases`}>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <Button variant="link" className="ps-0" onClick={() => navigate('/clients')}>
          ← Back to clients
        </Button>
        {purchases.length > 0 && (
          <Button variant="dark" onClick={handleDownloadTicket}>
            Download ticket PDF
          </Button>
        )}
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <strong>Type</strong>
              <div>
                <span className={`badge ${client.clientType === 'STAFF' ? 'bg-primary' : 'bg-secondary'}`}>
                  {typeLabel}
                </span>
              </div>
            </Col>
            <Col md={3}>
              <strong>Phone</strong>
              <div>{client.phoneNumber}</div>
            </Col>
            <Col md={3}>
              <strong>Email</strong>
              <div>{client.email || '—'}</div>
            </Col>
            <Col md={3}>
              <strong>Total purchases</strong>
              <div>{totals.count}</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="summary-card summary-total h-100">
            <Card.Body>
              <span className="summary-label">Total amount</span>
              <h4>{totals.all.toFixed(2)} MAD</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card summary-unpaid h-100">
            <Card.Body>
              <span className="summary-label">Not paid</span>
              <h4>{totals.unpaid.toFixed(2)} MAD</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="summary-card summary-paid h-100">
            <Card.Body>
              <span className="summary-label">Paid</span>
              <h4>{totals.paid.toFixed(2)} MAD</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>Purchase history</Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 purchase-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Total (MAD)</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id} className={p.paid ? 'purchase-row-paid' : ''}>
                  <td>{new Date(p.purchaseDate).toLocaleString()}</td>
                  <td>{p.productName}</td>
                  <td>{Number(p.unitPrice).toFixed(2)}</td>
                  <td>{p.discountPercent > 0 ? `-${p.discountPercent}%` : '—'}</td>
                  <td>{Number(p.totalPrice).toFixed(2)}</td>
                  <td>
                    <div className="payment-btn-group">
                      <Button
                        size="sm"
                        variant={!p.paid ? 'warning' : 'outline-secondary'}
                        disabled={updatingId === p.id}
                        onClick={() => handlePaymentChange(p.id, false)}
                      >
                        Not Paid
                      </Button>
                      <Button
                        size="sm"
                        variant={p.paid ? 'success' : 'outline-secondary'}
                        disabled={updatingId === p.id}
                        onClick={() => handlePaymentChange(p.id, true)}
                      >
                        Paid
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No purchases for this client yet
                  </td>
                </tr>
              )}
            </tbody>
            {purchases.length > 0 && (
              <tfoot>
                <tr className="purchase-total-row">
                  <td colSpan={4} className="text-end fw-bold">Total</td>
                  <td className="fw-bold">{totals.all.toFixed(2)} MAD</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </Table>
        </Card.Body>
      </Card>
    </Layout>
  );
}
