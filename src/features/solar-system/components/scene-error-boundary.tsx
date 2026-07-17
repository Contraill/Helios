"use client";

import { Component, type ReactNode } from "react";

interface SceneErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface SceneErrorBoundaryState {
  failed: boolean;
}

export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
