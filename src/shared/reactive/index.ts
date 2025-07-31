// Reactive Layer - Centralized RxJS Integration for React
// Best practices for React TypeScript 2025

// Core
export * from './core/ReactiveProvider';

// Hooks
export * from './hooks/useReactiveData';

// Components
export * from './components/ReactiveIndicator';

// Legacy exports (for backward compatibility)
export * from './stores/dashboard.store';
export * from './stores/activities.store';
export * from './stores/incidents.store';
export * from './stores/requirements.store';

export * from './streams/dashboard.streams';
export * from './streams/activities.streams';
export * from './streams/real-time.streams';

export * from './operators/custom.operators';
export * from './operators/error.operators';

export * from './subjects/shared.subjects'; 