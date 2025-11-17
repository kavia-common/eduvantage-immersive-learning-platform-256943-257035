import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Loader from "./components/common/Loader";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { routes as appRoutes } from "./routes";
import { AuthProvider } from "./auth/AuthProvider";
import "./App.css";
import { AssistantProvider } from "./state/assistantContext";

/**
 * Wrapper to extract current route label for TopNav title via Layout prop.
 * Ensures each route renders within the common Layout and theme styling.
 */
function RoutedLayout({ children }) {
  const location = useLocation();
  const match = appRoutes.find((r) => r.path === location.pathname);
  const title = match?.label || "EduVantage";
  return <Layout pageTitle={title}>{children}</Layout>;
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Root application component.
   * Renders the Router, wraps content with ErrorBoundary for safety,
   * and provides authentication via AuthProvider. All routes render
   * inside the shared Layout with Suspense fallback for lazy-loaded views.
   */
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <Suspense fallback={<Loader />}>
            <AssistantProvider>
              <RoutedLayout>
                <Routes>
                  {appRoutes.map((r) => (
                    <Route key={r.path} path={r.path} element={r.element} />
                  ))}
                </Routes>
              </RoutedLayout>
            </AssistantProvider>
          </Suspense>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
