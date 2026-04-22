export const passwordRules = [
  {
    name: "minLength",
    test: (password) => password.length >= 8,
    message: "8+ characters",
  },
  {
    name: "number",
    test: (password) => /\d/.test(password),
    message: "1 number",
  },
  {
    name: "lowerCase",
    test: (password) => /[a-z]/.test(password),
    message: "1 lowercase letter",
  },
  {
    name: "upperCase",
    test: (password) => /[A-Z]/.test(password),
    message: "1 uppercase letter",
  },
  {
    name: "specialChar",
    test: (password) => /[@#$%!]/.test(password),
    message: "1 special character",
  },
];

export const validatePassword = (password) => {
  const results = passwordRules.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));

  const missing = results
    .filter((result) => !result.passed)
    .map((result) => result.message);

  const isStrong = missing.length === 0;

  return {
    isStrong,
    missing,
    results,
  };
};

export const getPasswordErrorMessage = (missing) => {
  return `Password needs: ${missing.join(", ")}`;
};
