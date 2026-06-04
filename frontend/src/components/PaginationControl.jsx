import { Pagination } from 'react-bootstrap';

export default function PaginationControl({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const items = [];
  for (let i = 0; i < totalPages; i++) {
    items.push(
      <Pagination.Item key={i} active={i === page} onClick={() => onPageChange(i)}>
        {i + 1}
      </Pagination.Item>
    );
  }

  return (
    <Pagination className="justify-content-center mt-3">
      <Pagination.Prev disabled={page === 0} onClick={() => onPageChange(page - 1)} />
      {items}
      <Pagination.Next
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      />
    </Pagination>
  );
}
