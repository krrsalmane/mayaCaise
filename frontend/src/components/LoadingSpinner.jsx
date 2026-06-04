import { Spinner } from 'react-bootstrap';

export default function LoadingSpinner() {
  return (
    <div className="loading-container">
      <Spinner animation="border" variant="primary" />
      <span>Loading...</span>
    </div>
  );
}
