export const getEmailProvider = (email = "") => {
  if (!email) return "gmail";

  if (email.includes("@outlook") || email.includes("@hotmail"))
    return "outlook";

  if (email.includes("@yahoo"))
    return "yahoo";

  return "gmail";
};

export const EMAIL_PROVIDER_URLS = {
  gmail: "https://mail.google.com",
  outlook: "https://outlook.live.com",
  yahoo: "https://mail.yahoo.com",
};
