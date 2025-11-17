import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@twikkl/config/api';
import { setAuth } from '@twikkl/entities/auth.entity';

const GoogleAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const loginUrl = `${API_BASE_URL}/api/login`;
          const popup = window.open(
            loginUrl,
            'Replit Auth',
            'width=500,height=600,left=200,top=100'
          );

          const checkAuth = setInterval(async () => {
            if (popup && popup.closed) {
              clearInterval(checkAuth);
              
              try {
                const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
                  credentials: 'include',
                });

                if (response.ok) {
                  const data = await response.json();
                  if (data.authenticated && data.user) {
                    setAuth(data.user, 'replit_session');
                    router.replace('/NewHome');
                  } else {
                    router.back();
                  }
                } else {
                  router.back();
                }
              } catch (error) {
                console.error('Auth check error:', error);
                router.back();
              }
            }
          }, 500);

          setTimeout(() => {
            clearInterval(checkAuth);
            if (popup && !popup.closed) {
              popup.close();
              router.back();
            }
          }, 60000);
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.back();
      }
    };

    handleAuth();
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#50A040" />
      </View>
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
