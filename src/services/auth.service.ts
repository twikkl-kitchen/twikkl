import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '@twikkl/config/api';

const TOKEN_KEY = '@twikkl_auth_token';
const USER_KEY = '@twikkl_user';

export interface User {
  id: string;
  google_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
}

class AuthService {
  // Save authentication data
  async saveAuth(token: string, user: User) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }

  // Get stored token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Get stored user
  async getUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  // Fetch current user from API
  async fetchCurrentUser(): Promise<User | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token expired or invalid
        await this.logout();
        return null;
      }

      const data = await response.json();
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  // Logout
  async logout() {
    try {
      const token = await this.getToken();
      
      // Call backend logout
      if (token) {
        await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      // Clear local storage
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Get auth header for API requests
  async getAuthHeader(): Promise<{ Authorization: string } | {}> {
    const token = await this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export default new AuthService();
