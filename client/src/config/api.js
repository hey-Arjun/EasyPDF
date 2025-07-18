const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://44.203.67.82:3000';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  UPLOAD_PDF: `${API_BASE_URL}/api/organize/merge`,
  // Add more endpoints as needed
};

export default API_BASE_URL;
