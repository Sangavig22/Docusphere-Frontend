import React, { useEffect, useMemo, useRef, useState } from "react";
import { request } from "../../api/apiClient";
import { fetchVersionEditorConfig } from "../../services/documentVersionService";

function applyReadOnlyConfig(config) {
  if (!config || typeof config !== "object") return config;

  const editorConfig = { ...(config.editorConfig || {}) };
  editorConfig.mode = "view";
  editorConfig.customization = {
    ...(editorConfig.customization || {}),
    comments: false,
    chat: false,
    feedback: false,
    forcesave: false,
    help: false,
    hideRightMenu: true,
  };

  return {
    ...config,
    editorConfig,
  };
}

export default function OnlyOfficeEditor({
  documentId,
  versionId,
  readOnly = false,
  fetchConfig,
}) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const editorId = useMemo(
    () => `onlyoffice-editor-${documentId}-${versionId || "current"}`,
    [documentId, versionId],
  );
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

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
      const ONLYOFFICE_SERVER_URL = "http://localhost";
      script.src = import.meta.env.VITE_ONLYOFFICE_API_URL || `${ONLYOFFICE_SERVER_URL}/web-apps/apps/api/documents/api.js`;
      script.async = true;
      script.onload = initializeEditor;
      script.onerror = () => {
        setLoadError("Failed to load ONLYOFFICE Document Server API script.");
      };
      window.document.body.appendChild(script);
    } else if (window.DocsAPI) {
      initializeEditor();
    } else {
      script.onload = initializeEditor;
    }

    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroyEditor();
        } catch (error) {
          console.error("Failed to destroy editor", error);
        }
        editorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoadingConfig(true);
        let data;
        if (typeof fetchConfig === "function") {
          data = await fetchConfig();
        } else if (versionId) {
          data = await fetchVersionEditorConfig(documentId, versionId);
        } else {
          data = await request(`/editor/documents/${documentId}`);
        }
        setConfig(readOnly ? applyReadOnlyConfig(data) : data);
        setLoadError(null);
      } catch (error) {
        console.error("Failed to load ONLYOFFICE editor config:", error);
        setLoadError("Failed to load editor configuration from server. Please make sure backend is running.");
      } finally {
        setLoadingConfig(false);
      }
    };

    if (documentId) {
      loadConfig();
    }
  }, [documentId, versionId, readOnly, fetchConfig]);

  useEffect(() => {
    if (!scriptLoaded || !config || !window.DocsAPI) return;

    if (editorRef.current) {
      try {
        editorRef.current.destroyEditor();
      } catch (error) {
        console.error("Error destroying previous editor instance", error);
      }
      editorRef.current = null;
    }

    try {
      editorRef.current = new window.DocsAPI.DocEditor(editorId, config);
    } catch (error) {
      console.error("Failed to create DocEditor instance", error);
      setTimeout(() => {
        setLoadError("Failed to initialize ONLYOFFICE Document Editor.");
      }, 0);
    }
  }, [scriptLoaded, config, editorId]);

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
        <p className="text-gray-500 font-medium animate-pulse">
          {readOnly ? "Loading read-only version preview..." : "Loading ONLYOFFICE Editor..."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
      <div id={editorId} ref={containerRef} className="flex-1 w-full h-full" />
    </div>
  );
}
