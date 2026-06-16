import React, { useState, useEffect } from "react";
import { Camera, Upload } from "lucide-react";

const ProfilePhotoSection = ({ 
  displayPhoto, 
  name, 
  email, 
  onUploadClick, 
  onRemove 
}) => {
  const initial = (name?.trim()?.[0] || email?.trim()?.[0] || 'U').toUpperCase();

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [displayPhoto]);
  
  // Prepare image src and detect generated SVG avatars.
  let imageSrc = displayPhoto || null;
  const isGeneratedSvg = typeof imageSrc === 'string' && imageSrc.startsWith('data:image/svg+xml');
  if (imageSrc && typeof imageSrc === 'string' && (imageSrc.startsWith('http://') || imageSrc.startsWith('https://'))) {
    const sep = imageSrc.includes('?') ? '&' : '?';
    imageSrc = `${imageSrc}${sep}t=${Date.now()}`;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 32 }}>
      
      {/* Profile Circle */}
      <div style={{ position: "relative", width: 120, height: 120 }}>
        
        <div 
          style={{ 
            width: 120, 
            height: 120, 
            borderRadius: "50%", 
            background: "linear-gradient(90deg, var(--primary) 0%, #05152C 100%)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: 48, 
            color: "#fff", 
            boxShadow: "0 2px 8px #0002",
            overflow: "hidden"
          }}
        >
          {imageSrc && !imgError && !isGeneratedSvg ? (
            <img 
              src={imageSrc} 
              alt="Profile" 
              style={{ width: "100%", height: "100%", objectFit: "cover", display: 'block' }} 
              onError={() => setImgError(true)}
            />
          ) : (
            <span style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>{initial}</span>
          )}
        </div>
        <button
          type="button"
          onClick={onUploadClick}
          style={{ 
            position: "absolute", 
            bottom: 8, 
            left: 8, 
            background: "var(--card)", 
            border: "none", 
            boxShadow: "0 2px 6px #0002", 
            borderRadius: "50%", 
            width: 36, 
            height: 36, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            cursor: "pointer" 
          }}
          title="Upload photo"
        >
          <Camera size={20} />
        </button>
      </div>

      {/* Right side */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, marginBottom: 8, color: "var(--text)" }}>Profile photo</div>
        <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 12 }}>
          PNG, JPG up to 5MB.
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          
          {/* Upload button */}
          <button
            type="button"
            onClick={onUploadClick}
            style={{ 
              padding: "6px 18px", 
              borderRadius: 6, 
              border: "1px solid var(--border)", 
              background: "var(--card)", 
              fontWeight: 500, 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: 6 
            }}
          >
            <Upload size={18} /> Upload
          </button>

          {displayPhoto && (
            <button
              type="button"
              onClick={onRemove}
              style={{ 
                padding: "6px 18px", 
                borderRadius: 6, 
                border: "1px solid var(--border)", 
                background: "var(--card)", 
                fontWeight: 500, 
                cursor: "pointer" 
              }}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoSection;