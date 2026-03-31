import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallbackLabel } = this.props;
      return (
        <div role="alert" style={{ minHeight: fallbackLabel ? "auto" : "100vh", background: "#09090B", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", color: "#FCA5A5", padding: fallbackLabel ? 20 : 40, textAlign: "center" }}>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 8, color: "#FCA5A5" }}>
              Algo sali\u00F3 mal / Something went wrong
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, maxWidth: 400, margin: "0 auto" }}>
              {this.state.error?.message || "Error inesperado / Unexpected error"}
            </p>
            {fallbackLabel && (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4 }}>
                {fallbackLabel}
              </p>
            )}
            <button
              onClick={this.handleRetry}
              aria-label="Reintentar / Retry"
              style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #6EE7C7)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}
            >
              Reintentar / Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
