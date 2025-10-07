// Auth utility functions
export const validateAuthData = (): boolean => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      return false;
    }

    // Parse and validate user data
    const user = JSON.parse(userStr);
    if (!user.id || !user.username) {
      clearAuthData();
      return false;
    }

    // Basic token validation - handle both JWT and session tokens
    try {
      // Try to decode as session token first
      const decodedToken = JSON.parse(atob(token));
      if (decodedToken.username && decodedToken.timestamp) {
        // Check if token is not too old (optional - set expiry)
        const tokenAge = Date.now() - decodedToken.timestamp;
        const MAX_TOKEN_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (tokenAge > MAX_TOKEN_AGE) {
          clearAuthData();
          return false;
        }
      }
      // If it's a session token format, validate it. If not, assume it's a JWT and just check it exists
      return true;
    } catch (tokenError) {
      // If decoding fails, it might be a JWT token - just check it exists and is not empty
      if (token && token.length > 10) {
        return true;
      }
      clearAuthData();
      return false;
    }
  } catch (error) {
    clearAuthData();
    return false;
  }
};

export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return validateAuthData();
};