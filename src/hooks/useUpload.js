import { useState } from "react";
import { uploadService } from "../services/uploadService";
import { UPLOAD_CONSTANTS } from "../constants/uploadConstants";
import authService from "../services/authService";
import { getUserIdFromToken } from "../utils/authToken";

const {
  CHUNK_SIZE,
  MAX_FILE_SIZE,
  MAX_PARALLEL_UPLOADS,
} = UPLOAD_CONSTANTS;
const TEAM_ID_STORAGE_KEY = "teamId";

function readTeamIdFromStorage() {
  if (typeof window === "undefined") return "";
  const direct =
    window.localStorage.getItem(TEAM_ID_STORAGE_KEY) ||
    window.sessionStorage.getItem(TEAM_ID_STORAGE_KEY) ||
    "";
  if (direct.trim()) return direct.trim();

  const currentUserRaw =
    window.localStorage.getItem("currentUser") || window.sessionStorage.getItem("currentUser") || "";
  if (!currentUserRaw) return "";

  try {
    const parsed = JSON.parse(currentUserRaw);
    return String(parsed?.teamId || parsed?.teamUUID || parsed?.team_id || "").trim();
  } catch {
    return "";
  }
}

export const useUpload = (onComplete) => {
  const [status, setStatus] = useState("idle");
  const [percent, setPercent] = useState(0);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [speed, setSpeed] = useState("");


  // prevent empty upload
  const startUpload = async (selectedFile, ownerId, teamId) => {
    if (!selectedFile) {
      setStatus("error");
      setError("No file selected");
      return;
    }

  // prevent upload of files larger than MAX_FILE_SIZE
    if (selectedFile.size > MAX_FILE_SIZE) {
      setStatus("error");
      setError("File exceeds maximum allowed size");
      return;
    }

  // prevent unauthorized access
    const token = authService.getToken()?.trim();
    if (!token) {
      setStatus("error");
      setError("Missing auth token. Please sign in again.");
      return;
    }

    const tokenUserId = getUserIdFromToken(token);
    const resolvedOwnerId = String(ownerId || tokenUserId || "").trim();

    // Team id is intentionally not decoded from JWT.
    const teamIdFromStorage = readTeamIdFromStorage();
    const rawTeamId = String(teamId || teamIdFromStorage || "").trim();
    const resolvedTeamId = rawTeamId || "";

    setFile(selectedFile);
    setStatus("uploading");
    setPercent(0);
    setError("");
    setSpeed("");

    let fileId;
    let uploadedBytes = 0;
    const startTime = Date.now();

    try {

      //Initialize upload session and get fileId for chunk uploads
      const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
      const init = await uploadService.initUpload(selectedFile, {
        ownerId: resolvedOwnerId,
        teamId: resolvedTeamId || undefined,
        totalChunks,
        chunkSize: CHUNK_SIZE,
      });
      fileId = init?.data?.fileId || init?.fileId;

      if (!fileId) {
        throw new Error("Upload init succeeded but fileId is missing from response");
      }

      const chunks = Array.from({ length: totalChunks }, (_, i) => ({
        index: i,
        start: i * CHUNK_SIZE,
        end: Math.min(selectedFile.size, (i + 1) * CHUNK_SIZE),
        status: "pending",
      }));

      const uploadChunk = async (chunk) => {
        const blob = selectedFile.slice(chunk.start, chunk.end);


        // Send to Bakcend Formdata
        const formData = new FormData();
        formData.append("file", blob);
        formData.append("fileId", String(fileId));
        formData.append("fileName", selectedFile.name);
        formData.append("chunkIndex", String(chunk.index));
        formData.append("totalChunks", String(totalChunks));
        if (resolvedOwnerId) formData.append("ownerId", resolvedOwnerId);

        if (resolvedTeamId) formData.append("teamId", resolvedTeamId);

        await uploadService.uploadChunk(formData);


        //Update progress  bar  and speed
        chunk.status = "done";
        uploadedBytes += blob.size;

        const progress = Math.round(
          (uploadedBytes / selectedFile.size) * 100
        );
        setPercent(progress);

        const seconds = (Date.now() - startTime) / 1000;
        const spd = uploadedBytes / seconds;
        setSpeed(`${(spd / 1024 / 1024).toFixed(2)} MB/s`);
      };

      let active = 0;

      await new Promise((resolve, reject) => {
        const process = () => {
          if (chunks.every((c) => c.status === "done")) return resolve();

          //Maximum parallel uplaods
          while (active < MAX_PARALLEL_UPLOADS) {
            const next = chunks.find((c) => c.status === "pending");
            if (!next) break;

            active++;
            next.status = "uploading";

            uploadChunk(next)
              .then(() => {
                active--;
                process();
              })
              .catch((err) => {
                active--;
                next.status = "failed";
                reject(err);
              });
          }
        };

        process();
      });
      
      // Ensure it shows 100% at the end
      setPercent(100);
      
      // Small delay so user can see the 100% bar before it transitions
      await new Promise(r => setTimeout(r, 600));

      setStatus("success");
      onComplete?.(selectedFile);
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  };

  const reset = () => {
    setStatus("idle");
    setPercent(0);
    setFile(null);
    setError("");
    setSpeed("");
  };

  return {
    status,
    percent,
    file,
    error,
    speed,
    startUpload,
    reset,
  };
};