'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="error-fallback p-8 flex flex-col items-center justify-center min-h-[400px] text-center border-2 border-dashed border-[var(--error)] rounded-xl m-4 bg-[var(--surface-container)]">
            <div className="flex flex-col gap-6 max-w-md">
              <h2 className="text-2xl font-bold text-[var(--error)]">COMMUNICATIONS JAMMED</h2>
              <p className="text-muted">
                A localized solar flare has interrupted the transmission. 
                Please restart the Saily console to re-establish the link.
              </p>
              <div className="bg-black/20 p-4 rounded-lg font-mono text-xs text-left overflow-auto max-w-full text-amber-200">
                {this.state.error?.message}
              </div>
              <button 
                className="button button-primary"
                onClick={() => window.location.reload()}
              >
                Re-initialize Link
              </button>
            </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
