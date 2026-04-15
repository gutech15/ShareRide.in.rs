export const getImageUrl = (url) => {
  const API_BASE_URL = "https://localhost:7021";
  const DEFAULT_IMAGE = "/default-avatar.svg";
  if (!url) return DEFAULT_IMAGE;
  if (url.startsWith("http")) return url;

  return `${API_BASE_URL}${url}`;
};
