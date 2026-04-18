import { User, Mail, Lock } from "lucide-react";

export const emailField = {
  type: "email",
  name: "email",
  placeholder: "Email Address",
  icon: Mail,
  required: true,
};

export const passwordField = {
  type: "password",
  name: "password",
  placeholder: "Password",
  icon: Lock,
  required: true,
};

export const confirmPasswordField = {
  type: "password",
  name: "confirmPassword",
  placeholder: "Confirm Password",
  icon: Lock,
  required: true,
};

export const fullNameField = {
  type: "text",
  name: "fullName",
  placeholder: "Full Name",
  icon: User,
  required: true,
  className: "mt-4",
};

export const signInFields = [emailField, { ...passwordField, className: "mt-3" }];

export const signUpFields = [
  fullNameField,
  emailField,
  passwordField,
  confirmPasswordField,
];

export const forgotPasswordFields = [emailField];

export const resetPasswordFields = [passwordField, confirmPasswordField];
