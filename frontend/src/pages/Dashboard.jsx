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
    { label: 'Products', value: stats.totalProducts, color: '#6f4e37' },
    { label: 'Clients', value: stats.totalClients, color: '#2d6a4f' },
    { label: 'Total Sales', value: `${Number(stats.totalSalesAmount).toFixed(2)} MAD`, color: '#bc6c25' },
    { label: 'Purchases', value: stats.totalPurchases, color: '#457b9d' },
  ];

  const salesByDay = [...(stats.salesByDay || [])].reverse();

  return (
    <Layout title="Dashboard">
      <Row className="g-4 mb-4">
        {cards.map((card) => (
          <Col key={card.label} xs={12} sm={6} xl={3}>
            <Card className="stat-card h-100">
              <Card.Body>
                <p className="stat-label">{card.label}</p>
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
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="totalAmount" stroke="#6f4e37" strokeWidth={2} />
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
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalQuantitySold" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
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
