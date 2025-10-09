import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import authService from '@twikkl/services/auth.service';
import { API_ENDPOINTS } from '@twikkl/config/api';

const GoogleAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const handleNavigationStateChange = async (navState: any) => {
    const { url } = navState;

    // Check if this is the callback URL with token
    if (url.includes('twikkl://auth')) {
      try {
        // Extract token and user from URL
        const urlParams = new URL(url);
        const token = urlParams.searchParams.get('token');
        const userJson = urlParams.searchParams.get('user');

        if (token && userJson) {
          const user = JSON.parse(decodeURIComponent(userJson));
          
          // Save authentication data
          await authService.saveAuth(token, user);

          // Navigate to home
          router.replace('/NewHome');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.back();
      }
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#50A040" />
        </View>
      )}
      <WebView
        source={{ uri: API_ENDPOINTS.AUTH.GOOGLE }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 1,
  },
});

export default GoogleAuth;
