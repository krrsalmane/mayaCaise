import Sidebar from './Sidebar';

export default function Layout({ children, title }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {title && (
          <header className="page-header">
            <h2>{title}</h2>
          </header>
        )}
        <div className="page-body">{children}</div>
      </main>
    </div>
  );
}
