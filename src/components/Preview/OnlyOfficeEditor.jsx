import React, { useEffect, useRef, useState } from "react";
import { request } from "../../api/apiClient";

export default function OnlyOfficeEditor({ documentId }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // 1. Load ONLYOFFICE API Script
  useEffect(() => {
    const scriptId = "onlyoffice-api-script";
    let script = window.document.getElementById(scriptId);

    const initializeEditor = () => {
      if (!window.DocsAPI) {
        setLoadError("ONLYOFFICE API script loaded but window.DocsAPI is not available.");
        return;
      }
      setScriptLoaded(true);
    };

    if (!script) {
      script = window.document.createElement("script");
      script.id = scriptId;
      script.src = import.meta.env.VITE_ONLYOFFICE_API_URL || "http://localhost:80/web-apps/apps/api/documents/api.js";
      script.async = true;
      script.onload = initializeEditor;
      script.onerror = () => {
        setLoadError("Failed to load ONLYOFFICE Document Server API script.");
      };
      window.document.body.appendChild(script);
    } else {
      if (window.DocsAPI) {
        initializeEditor();
      } else {
        script.onload = initializeEditor;
      }
    }

    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroyEditor();
        } catch (e) {
          console.error("Failed to destroy editor", e);
        }
        editorRef.current = null;
      }
    };
  }, []);

  // 2. Fetch Config from Backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoadingConfig(true);
        const data = await request(`/editor/documents/${documentId}`);
        setConfig(data);
        setLoadError(null);
      } catch (err) {
        console.error("Failed to load ONLYOFFICE editor config:", err);
        setLoadError("Failed to load editor configuration from server. Please make sure backend is running.");
      } finally {
        setLoadingConfig(false);
      }
    };

    if (documentId) {
      fetchConfig();
    }
  }, [documentId]);

  // 3. Initialize DocEditor when script and config are ready
  useEffect(() => {
    if (!scriptLoaded || !config || !window.DocsAPI) return;

    // Destroy existing instance if there is one
    if (editorRef.current) {
      try {
        editorRef.current.destroyEditor();
      } catch (e) {
        console.error("Error destroying previous editor instance", e);
      }
      editorRef.current = null;
    }

    try {
      editorRef.current = new window.DocsAPI.DocEditor(containerRef.current.id, config);
    } catch (err) {
      console.error("Failed to create DocEditor instance", err);
      setTimeout(() => {
        setLoadError("Failed to initialize ONLYOFFICE Document Editor.");
      }, 0);
    }
  }, [scriptLoaded, config]);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-xl bg-red-50 text-red-800">
        <h4 className="font-semibold text-lg mb-2">ONLYOFFICE Editor Loading Failed</h4>
        <p className="text-sm mb-4">{loadError}</p>
        <p className="text-xs text-gray-500">Please verify ONLYOFFICE Document Server is running and accessible.</p>
      </div>
    );
  }

  if (!scriptLoaded || loadingConfig || !config) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-gray-500 font-medium animate-pulse">Loading ONLYOFFICE Editor...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
      <div id="onlyoffice-editor" ref={containerRef} className="flex-1 w-full h-full" />
    </div>
  );
}
