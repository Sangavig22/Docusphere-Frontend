import React, { useRef, useState, useEffect } from "react";
import authService from "../services/authService";
import InputField from "../components/Authentication/InputField";
import { fullNameField, emailField, passwordField, confirmPasswordField } from "../constants/authField";
import PasswordIndicator from "../components/Authentication/PasswordIndicator";
import PhotoCropper from "../components/Authentication/PhotoCropper";
import useForm from "../hooks/useForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SettingsBox from "../components/Authentication/SettingsBox";
import FormActions from "../components/Authentication/FormActions";
import ProfilePhotoSection from "../components/Authentication/ProfilePhotoSection";
import { useUser } from "../context/UserContext";

const SettingsPage = () => {
  const settingsInputClass =
    "mt-0 !max-w-none !transform-none !transition-none hover:!transform-none hover:!translate-y-0 !hover:border-border !hover:bg-card/30 !hover:shadow-2xl [&>input]:!text-base";

  const { user, updateUser, refreshUser } = useUser();

  const [photoPreview, setPhotoPreview] = useState(null);
  const [cropImage, setCropImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("docusphere_notifications_enabled") !== "false"
  );

  const handleToggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem("docusphere_notifications_enabled", String(newValue));
    window.dispatchEvent(new Event("docusphere-notifications-toggle"));
    if (newValue) {
      toast.success("Real-time notifications enabled!");
    } else {
      toast.info("Notifications paused.");
    }
  };

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const {
    formData: editProfile,
    setFormData: setEditProfile,
    handleChange: handleProfileChange,
    resetForm: resetProfileForm
  } = useForm({
    photo: user.photo || "",
    name: user.name || "",
    email: user.email || "",
  });

  const {
    formData: passwordForm,
    setFormData: setPasswordForm,
    handleChange: handlePasswordChange,
    resetForm: resetPasswordForm
  } = useForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    setEditProfile({
      photo: user.photo || "",
      name: user.name || "",
      email: user.email || "",
    });
    
  }, [user]);

  // Password change state
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordCancel = () => {
    resetPasswordForm();
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      toast.error("New password must be different from current password!");
      return;
    }

    try {
      const response = await authService.changePassword(passwordForm);
      toast.success(response?.message || "Password updated!");
      handlePasswordCancel();
    } catch (error) {
      toast.error(error.message || "Failed to update password.");
    }
  };

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCropImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCropCancel = () => {
    setCropImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

 const handleCropSave = ({ previewUrl, file }) => {
  setPhotoPreview(previewUrl);
  setSelectedFile(file);

  setEditProfile((prev) => ({
    ...prev,
    photo: previewUrl
  }));

  setCropImage(null);
};

  // Remove photo
  const handleRemovePhoto = () => {
    setEditProfile((prev) => ({ ...prev, photo: null }));
    setPhotoPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    updateUser({ photo: null });
  };

  // Save changes
  const handleSave = async (e) => {
    e.preventDefault();
    const isPhotoRemoved = !selectedFile && (editProfile.photo === null || editProfile.photo === "");
    const formData = new FormData();
    formData.append("fullName", editProfile.name || "");
    if (selectedFile) {
      formData.append("profilePicture", selectedFile);
    } else if (isPhotoRemoved) {
      formData.append("removeProfilePicture", "true");
    }

    try {
      await authService.updateProfile(formData);

      // If user removed photo (no selected file and photo cleared in form),
      // force a local update so the UI reflects the removal immediately.
      if (isPhotoRemoved) {
        authService.saveProfileUpdate({ full_name: editProfile.name || authService.getUserFullName(), profile_picture_url: '' });
        const forcedPhoto = authService.getProfilePicture();
        setEditProfile((prev) => ({ ...prev, photo: forcedPhoto, name: editProfile.name || authService.getUserFullName() }));
        updateUser({ photo: forcedPhoto, name: editProfile.name || authService.getUserFullName() });
      } else {
        const finalPhoto = authService.getProfilePicture();
        setEditProfile((prev) => ({
          ...prev,
          photo: finalPhoto,
          name: editProfile.name || authService.getUserFullName(),
        }));
        updateUser({ photo: finalPhoto, name: editProfile.name || authService.getUserFullName() });
      }

      refreshUser();

      setPhotoPreview(null);
      setSelectedFile(null);

      window.dispatchEvent(new Event("user-profile-updated"));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile.");
    }
  };


  // Cancel changes
  const handleCancel = () => {
    setEditProfile({
      photo: user.photo || "",
      name: user.name || "",
      email: user.email || "",
    });
    setPhotoPreview(null);
    resetProfileForm();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Show preview if editing, else show saved
  const displayPhoto = photoPreview || editProfile.photo || null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 0 }}>
      {/* Photo Cropper Modal */}
      {cropImage && (
        <PhotoCropper
          image={cropImage}
          onCancel={handleCropCancel}
          onCrop={handleCropSave}
        />
      )}
      {/* Profile Settings Box */}
      <SettingsBox title="Profile Information" subtitle="Update your photo and personal details.">
        <form onSubmit={handleSave}>
        <ProfilePhotoSection
          displayPhoto={displayPhoto}
          name={editProfile.name}
          email={editProfile.email}
          onUploadClick={() => fileInputRef.current && fileInputRef.current.click()}
          onRemove={handleRemovePhoto}
        />
        <input
          type="file"
          accept="image/png, image/jpeg"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handlePhotoChange}
        />
        <hr style={{ margin: "32px 0 24px 0", border: 0, borderTop: "1px solid #eee" }} />
        <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontWeight: 500, fontSize: 18, marginBottom: 8 }}>Full name</label>
            <InputField
              type={fullNameField.type}
              name="name"
              value={editProfile.name}
              onChange={handleProfileChange}
              placeholder={fullNameField.placeholder}
              required={fullNameField.required}
              icon={fullNameField.icon}
              className={settingsInputClass}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontWeight: 500, fontSize: 18, marginBottom: 8 }}>Email address</label>
            <InputField
              type={emailField.type}
              name="email"
              value={editProfile.email}
              onChange={() => {}}
              placeholder={emailField.placeholder}
              required={emailField.required}
              icon={emailField.icon}
              className={settingsInputClass}
            />
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Email cannot be changed.</div>
          </div>
        </div>
        <FormActions onCancel={handleCancel} submitLabel="Save Changes" />
        </form>
      </SettingsBox>

      {/* Notification Settings Box */}
      <SettingsBox title="Notification Settings" subtitle="Control how and when you receive real-time alerts.">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0",
          borderBottom: "1px solid var(--border)",
          marginBottom: 16
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18, color: "var(--text)" }}>Enable Push Notifications</div>
            <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
              Receive real-time chime sounds, popup toasts, and menu badge alerts for document shares and team invites.
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleNotifications}
            style={{
              position: "relative",
              width: 52,
              height: 28,
              borderRadius: 9999,
              background: notificationsEnabled ? "linear-gradient(135deg, #6366F1, #4F46E5)" : "#D1D5DB",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              alignItems: "center",
              padding: "0 4px",
              boxShadow: notificationsEnabled ? "0 0 12px rgba(99, 102, 241, 0.4)" : "none",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#FFFFFF",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: notificationsEnabled ? "translateX(24px)" : "translateX(0)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            />
          </button>
        </div>
      </SettingsBox>

      {/* Change Password Box */}
      <SettingsBox title="Change Password" subtitle="Use a strong password you don't reuse anywhere else.">
        <form onSubmit={handlePasswordUpdate} autoComplete="off">
          <div style={{ marginBottom: 28, width: "calc(50% - 12px)" }}>
            <label style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, display: 'block', color: 'var(--text)' }}>Current password</label>
            <InputField
              type={passwordField.type}
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              onFocus={() => setShowCurrent(true)}
              onBlur={() => setShowCurrent(false)}
              placeholder="Enter current password"
              required={passwordField.required}
              icon={passwordField.icon}
              className={settingsInputClass}
            />
          </div>
          <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, display: 'block', color: 'var(--text)' }}>New password</label>
              <InputField
                type={passwordField.type}
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                onFocus={() => setShowNew(true)}
                onBlur={() => setShowNew(false)}
                placeholder="Enter new password"
                required={passwordField.required}
                icon={passwordField.icon}
                className={settingsInputClass}
              />
              <PasswordIndicator password={passwordForm.newPassword} isFocused={showNew || showConfirm} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, display: 'block', color: 'var(--text)' }}>Confirm new password</label>
              <InputField
                type={confirmPasswordField.type}
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                onFocus={() => setShowConfirm(true)}
                onBlur={() => setShowConfirm(false)}
                placeholder="Re-enter new password"
                required={confirmPasswordField.required}
                icon={confirmPasswordField.icon}
                className={settingsInputClass}
              />
            </div>
          </div>
          <FormActions onCancel={handlePasswordCancel} submitLabel="Update Password" />
        </form>
      </SettingsBox>

    <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default SettingsPage;
