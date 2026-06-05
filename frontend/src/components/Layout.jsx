import Sidebar from './Sidebar';

export default function Layout({ children, title }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {title && (
          <header className="page-header">
            <h2>{title}</h2>
            <p className="page-subtitle">Manage your café operations efficiently</p>
          </header>
        )}
        <div className="page-body">{children}</div>
      </main>
    </div>
  );
}
