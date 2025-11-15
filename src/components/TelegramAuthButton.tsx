import React from 'react';
import TelegramLoginButton from 'react-telegram-login';
import { Platform } from 'react-native';
import { setAuth } from '@twikkl/entities/auth.entity';
import { useRouter } from 'expo-router';
import { toastSuccess } from '@twikkl/utils/common';

interface TelegramAuthButtonProps {
  botName: string;
}

const TelegramAuthButton: React.FC<TelegramAuthButtonProps> = ({ botName }) => {
  const router = useRouter();

  const handleTelegramResponse = async (response: any) => {
    try {
      // Send Telegram auth data to backend for verification
      const res = await fetch('http://localhost:3001/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      });

      if (!res.ok) {
        throw new Error('Telegram authentication failed');
      }

      const data = await res.json();
      
      // Set user authentication state
      setAuth(data.user, 'telegram_session');
      toastSuccess('Welcome to Twikkl!');
      
      // Redirect to home
      router.push('/(tabs)');
    } catch (error) {
      console.error('Telegram auth error:', error);
    }
  };

  // Only render on web platform (Telegram widget requires web environment)
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <TelegramLoginButton
      dataOnauth={handleTelegramResponse}
      botName={botName}
      buttonSize="large"
      cornerRadius={10}
      requestAccess="write"
    />
  );
};

export default TelegramAuthButton;
