import React from 'react';
import { Button, Result } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          padding: '20px'
        }}>
          <Result
            status="error"
            title="Terjadi Kesalahan"
            subTitle="Maaf, terjadi kesalahan yang tidak terduga. Silakan muat ulang halaman."
            extra={[
              <Button type="primary" key="home" onClick={this.handleReset}>
                Kembali ke Beranda
              </Button>,
              <Button key="reload" onClick={() => window.location.reload()}>
                Muat Ulang
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;