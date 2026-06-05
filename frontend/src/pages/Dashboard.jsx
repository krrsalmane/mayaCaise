import { useEffect, useState } from 'react';
import { Card, Col, Row, Table } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardApi } from '../api/services';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><LoadingSpinner /></Layout>;
  if (error) return <Layout title="Dashboard"><div className="alert alert-danger">{error}</div></Layout>;

  const cards = [
    { label: 'Products', value: stats.totalProducts, color: 'var(--color-primary)', icon: '☕' },
    { label: 'Clients', value: stats.totalClients, color: 'var(--color-success)', icon: '👥' },
    { label: 'Total Sales', value: `${Number(stats.totalSalesAmount).toFixed(2)} MAD`, color: 'var(--color-accent)', icon: '💰' },
    { label: 'Purchases', value: stats.totalPurchases, color: 'var(--color-info)', icon: '🛒' },
  ];

  const salesByDay = [...(stats.salesByDay || [])].reverse();

  return (
    <Layout title="Dashboard">
      <Row className="g-4 mb-4">
        {cards.map((card) => (
          <Col key={card.label} xs={12} sm={6} xl={3}>
            <Card className="stat-card h-100">
              <Card.Body className="d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <p className="stat-label mb-0">{card.label}</p>
                  <span style={{ fontSize: '2rem', opacity: 0.8 }}>{card.icon}</span>
                </div>
                <h3 className="stat-value" style={{ color: card.color }}>{card.value}</h3>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>Sales by Day</Card.Header>
            <Card.Body>
              {salesByDay.length === 0 ? (
                <p className="text-muted mb-0">No sales data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis dataKey="date" stroke="#7f8c8d" />
                    <YAxis stroke="#7f8c8d" />
                    <Tooltip />
                    <Line type="monotone" dataKey="totalAmount" stroke="var(--color-primary)" strokeWidth={3} dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header>Most Sold Products</Card.Header>
            <Card.Body>
              {(stats.mostSoldProducts || []).length === 0 ? (
                <p className="text-muted mb-0">No product sales yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.mostSoldProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis dataKey="productName" stroke="#7f8c8d" />
                    <YAxis stroke="#7f8c8d" />
                    <Tooltip />
                    <Bar dataKey="totalQuantitySold" fill="var(--color-success)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>Top Products Detail</Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty Sold</th>
                <th>Revenue (MAD)</th>
              </tr>
            </thead>
            <tbody>
              {(stats.mostSoldProducts || []).map((p) => (
                <tr key={p.productId}>
                  <td>{p.productName}</td>
                  <td>{p.totalQuantitySold}</td>
                  <td>{Number(p.totalRevenue).toFixed(2)}</td>
                </tr>
              ))}
              {(stats.mostSoldProducts || []).length === 0 && (
                <tr><td colSpan={3} className="text-center text-muted py-4">No data</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Layout>
  );
}
