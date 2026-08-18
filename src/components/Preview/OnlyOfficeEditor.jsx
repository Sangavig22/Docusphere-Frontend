import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { request } from "../../api/apiClient";
import { fetchVersionEditorConfig, forceSaveDocument } from "../../services/documentVersionService";
import { verifyDocumentPassword } from "../../services/documentProtectionService";
import { getUnlockSession, setUnlockSession } from "../../utils/documentProtection";
import PasswordVerifyModal from "../documents/secure/PasswordVerifyModal";

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

const OnlyOfficeEditor = forwardRef(({
  documentId,
  versionId,
  readOnly = false,
  fetchConfig,
  enabled = true,
  resolveConfigError,
  externalConfig = null,
}, ref) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const documentKeyRef = useRef(null);
  const editorId = useMemo(
    () => `onlyoffice-editor-${documentId}-${versionId || "current"}`,
    [documentId, versionId],
  );
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useImperativeHandle(ref, () => ({
    forceSave: async () => {
      try {
        await forceSaveDocument(documentId);
        return true;
      } catch (error) {
        console.error("Force save failed:", error);
        return false;
      }
    }
  }));

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

  const loadConfig = async (docPassword = "") => {
    try {
      setLoadingConfig(true);
      setErrorMessage("");

      let data;
      const sessionToken = getUnlockSession(documentId)?.token;
      const headers = {};
      if (docPassword) {
        headers["X-Document-Password"] = docPassword;
      } else if (sessionToken) {
        headers["X-Unlock-Token"] = sessionToken;
      }

      if (typeof fetchConfig === "function") {
        data = await fetchConfig({ headers });
      } else if (versionId) {
        data = await fetchVersionEditorConfig(documentId, versionId, {
          password: docPassword,
          unlockToken: sessionToken
        });
      } else {
        data = await request(`/editor/documents/${documentId}`, {
          headers,
          skipAuthRedirect: true,
        });
      }
      setConfig(readOnly ? applyReadOnlyConfig(data) : data);
      setLoadError(null);
      setShowPasswordModal(false);
    } catch (error) {
      console.error("Failed to load ONLYOFFICE editor config:", error);

      const status = error.status;
      const errCode = error.data?.errorCode;
      const errMsg = error.message;

      if (status === 401 && errCode === "DOCUMENT_PASSWORD_REQUIRED") {
        setShowPasswordModal(true);
      } else if (status === 400 && errCode === "INVALID_PASSWORD") {
        setErrorMessage("Incorrect password. Please try again.");
        setShowPasswordModal(true);
      } else {
        const message =
          typeof resolveConfigError === "function"
            ? resolveConfigError(error)
            : errMsg || "Failed to load editor configuration from server.";
        setLoadError(message);
      }
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setLoadingConfig(false);
      return;
    }

    if (externalConfig) {
      setConfig(readOnly ? applyReadOnlyConfig(externalConfig) : externalConfig);
      setLoadError(null);
      setLoadingConfig(false);
      return;
    }

    if (documentId && enabled) {
      loadConfig();
    }
  }, [documentId, versionId, readOnly, fetchConfig, enabled, resolveConfigError, externalConfig]);

  useEffect(() => {
    if (!scriptLoaded || !config || !window.DocsAPI) return;

    const nextKey = config?.document?.key ?? null;
    if (editorRef.current && documentKeyRef.current === nextKey) {
      return;
    }

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
      documentKeyRef.current = nextKey;
    } catch (error) {
      console.error("Failed to create DocEditor instance", error);
      setTimeout(() => {
        setLoadError("Failed to initialize ONLYOFFICE Document Editor.");
      }, 0);
    }
  }, [scriptLoaded, config, editorId]);

  const handleVerifyPassword = async (passwordInput) => {
    setLoadingConfig(true);
    setErrorMessage("");
    try {
      const { unlockSession } = await verifyDocumentPassword(documentId, passwordInput);
      setUnlockSession(documentId, unlockSession);
      await loadConfig(passwordInput);
    } catch (err) {
      console.error("Verification failed:", err);
      const status = err.status;
      const errCode = err.data?.errorCode;
      const errMsg = err.message || "";

      if (status === 400 || errCode === "INVALID_PASSWORD" || /invalid|incorrect|wrong/i.test(errMsg)) {
        setErrorMessage("Incorrect password. Please try again.");
      } else {
        setErrorMessage(errMsg || "Verification failed. Please try again.");
      }
    } finally {
      setLoadingConfig(false);
    }
  };

  if (!enabled) {
    return null;
  }

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
        {showPasswordModal ? (
          <PasswordVerifyModal
            open={showPasswordModal}
            loading={loadingConfig}
            error={errorMessage}
            onClose={() => {
              setShowPasswordModal(false);
              setLoadError("Password verification is required to view this document.");
            }}
            onUnlock={handleVerifyPassword}
          />
        ) : (
          <>
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-gray-500 font-medium animate-pulse">
              {readOnly ? "Loading read-only version preview..." : "Loading ONLYOFFICE Editor..."}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden bg-white flex flex-col">
      <div id={editorId} ref={containerRef} className="h-full w-full min-h-0" />
    </div>
  );
});

export default OnlyOfficeEditor;
