import React from "react";

const SettingsBox = ({ title, subtitle, children, style = {} }) => (
  <div
    style={{
      background: "var(--card)",
      borderRadius: 16,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.18)",
      padding: 36,
      border: "1px solid var(--border)",
      marginBottom: 40,
      ...style,
    }}
  >
    {title && (
      <h2 style={{ marginBottom: subtitle ? 0 : 8, fontWeight: 700, fontSize: 28, color: "var(--text)" }}>{title}</h2>
    )}
    {subtitle && (
      <div style={{ color: "var(--muted)", marginBottom: 32, marginTop: 8, fontSize: 18 }}>{subtitle}</div>
    )}
    {children}
  </div>
);

export default SettingsBox;
