import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { setAuth } from '@twikkl/entities/auth.entity';
import { toastSuccess, toastError } from '@twikkl/utils/common';

interface TelegramLoginWidgetProps {
  botName: string;
}

const TelegramLoginWidget: React.FC<TelegramLoginWidgetProps> = ({ botName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) {
      return;
    }

    const handleTelegramAuth = async (user: any) => {
      try {
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Telegram authentication failed');
        }

        const data = await response.json();
        
        setAuth(data.user, 'telegram_session');
        toastSuccess('Welcome to Twikkl!');
        
        router.push('/NewHome');
      } catch (error) {
        console.error('Telegram auth error:', error);
        toastError('Authentication failed. Please try again.');
      }
    };

    (window as any).onTelegramAuth = handleTelegramAuth;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    containerRef.current.appendChild(script);

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [botName, router]);

  return (
    <View style={styles.container}>
      <div ref={containerRef as any} style={{ display: 'flex', justifyContent: 'center' }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TelegramLoginWidget;
