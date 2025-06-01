import React, { Component } from 'react';

/**
 * Error boundary component to catch errors in child components
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static defaultProps = {
    fallback: null,
    onError: () => {}
  };

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="form-builder-error-boundary">
          <h2>Something went wrong.</h2>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          {this.props.resetErrorBoundary && (
            <button 
              className="form-builder-btn form-builder-btn-primary"
              onClick={this.props.resetErrorBoundary}
            >
              Try Again
            </button>
          )}
          {process.env.NODE_ENV !== 'production' && (
            <details className="form-builder-error-details">
              <summary>Error Details</summary>
              <pre>{this.state.error && this.state.error.toString()}</pre>
              <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    // When no error, just render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;