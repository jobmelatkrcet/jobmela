import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled Application Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            textAlign: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 500,
              width: '100%',
              backgroundColor: '#ffffff',
              border: '1.5px solid #fecaca',
              borderRadius: 16,
              padding: '2rem 1.5rem',
              boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.1)',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <AlertCircle size={28} />
            </div>

            <h3 style={{ margin: '0 0 0.5rem', color: '#991b1b', fontSize: '1.25rem' }}>
              Something went wrong loading this section
            </h3>

            <p style={{ margin: '0 0 1.25rem', color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
              A temporary display error occurred. Please refresh the page to restore your view.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#b91c1c',
                  fontFamily: 'monospace',
                  marginBottom: '1.25rem',
                  textAlign: 'left',
                  maxHeight: 120,
                  overflowY: 'auto',
                  wordBreak: 'break-all',
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <RefreshCw size={14} /> Refresh Page
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <Home size={14} /> Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
