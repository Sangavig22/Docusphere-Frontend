import React from "react";

const SettingsBox = ({ title, subtitle, children, style = {} }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 2px 8px #0001",
      padding: 36,
      border: "1px solid #eee",
      marginBottom: 40,
      ...style,
    }}
  >
    {title && (
      <h2 style={{ marginBottom: subtitle ? 0 : 8, fontWeight: 700, fontSize: 28 }}>{title}</h2>
    )}
    {subtitle && (
      <div style={{ color: "#666", marginBottom: 32, marginTop: 8, fontSize: 18 }}>{subtitle}</div>
    )}
    {children}
  </div>
);

export default SettingsBox;
