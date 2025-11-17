import React, { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import "./layout.css";

/**
 * Shell layout component providing Sidebar + TopNav and main outlet area.
 * Children content is rendered within the main surface.
 */

// PUBLIC_INTERFACE
export default function Layout({ children, pageTitle }) {
  const [collapsed, setCollapsed] = useState(false);
  const layoutClass = useMemo(() => (collapsed ? "collapsed" : "expanded"), [collapsed]);

  return (
    <div className={`lp-layout ${layoutClass}`}>
      <TopNav title={pageTitle} onMenu={() => setCollapsed((c) => !c)} />
      <div className="lp-body">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <main className="lp-content">
          <div className="content-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
