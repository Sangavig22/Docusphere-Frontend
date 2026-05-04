import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import PrimaryButton from "./PrimaryButton";

//Convert image URL to HTMLImageElement
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    if (!url.startsWith("data:")) {
      image.crossOrigin = "anonymous";
    }

    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);

    image.src = url;
  });
// Crop the image based on the selected area and return a blob URL and file object
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not initialize canvas context.");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = pixelCrop.width * scaleX;
  canvas.height = pixelCrop.height * scaleY;

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );
   
  // Convert canvas to blob 
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92)
  );

  if (!blob) {
    throw new Error("Failed to create cropped image.");
  }

  const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
  const previewUrl = URL.createObjectURL(blob);
  return { previewUrl, file };
}

const PhotoCropper = ({ image, onCancel, onCrop }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      if (!croppedAreaPixels) return;

      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCrop(croppedImage);
    } catch (error) {
      console.error("Crop failed:", error);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(20, 23, 31, 0.95)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#181c24", borderRadius: 10, minWidth: 400, minHeight: 480, position: "relative", boxShadow: "0 4px 32px #0008", padding: 0, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", background: "linear-gradient(to right, #114692, #05152C)" }}>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 20 }}>Crop your new profile picture</div>
          <button onClick={onCancel} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", marginLeft: 12, marginTop: -4 }}>×</button>
        </div>
        {/* Cropper */}
        <div style={{ width: 400, height: 400, background: "#23272f", margin: "18px auto 0 auto", borderRadius: 10, position: "relative" }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{ containerStyle: { borderRadius: '10px' } }}
          />
        </div>
        {/* Zoom Slider */}
        <div style={{ margin: "18px 32px 0 32px" }}>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#114692" }}
          />
        </div>
        <div style={{ padding: "24px 0 0 0", display: "flex", justifyContent: "center" }}>
          <PrimaryButton
            onClick={handleCrop}
            className="!mt-0 !w-[340px] !max-w-none !h-[52px] !text-lg !rounded-xl !mb-6"
          >
            Set new profile picture
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default PhotoCropper;
