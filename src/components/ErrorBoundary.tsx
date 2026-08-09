import React from 'react';
import { captureException } from '../lib/sentry';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    captureException(error, { componentStack: errorInfo.componentStack });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '32px',
          textAlign: 'center',
          background: '#0b1329',
          color: '#dae2fd',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: '2.4rem' }}>⚠️</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          예상치 못한 오류가 발생했습니다
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '420px' }}>
          잠시 후 다시 시도해주세요. 문제가 계속되면 페이지를 새로고침해주세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          새로고침
        </button>
      </div>
    );
  }
}
