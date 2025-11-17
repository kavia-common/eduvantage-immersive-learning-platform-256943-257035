import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Loader from "./components/common/Loader";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { routes as appRoutes } from "./routes";
import "./App.css";

/**
 * Wrapper to extract current route label for TopNav title via Layout prop.
 */
function RoutedLayout({ children }) {
  const location = useLocation();
  const match = appRoutes.find((r) => r.path === location.pathname);
  const title = match?.label || "EduVantage";
  return <Layout pageTitle={title}>{children}</Layout>;
}

// PUBLIC_INTERFACE
function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          <RoutedLayout>
            <Routes>
              {appRoutes.map((r) => (
                <Route key={r.path} path={r.path} element={r.element} />
              ))}
            </Routes>
          </RoutedLayout>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
