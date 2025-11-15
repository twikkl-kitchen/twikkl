declare module 'react-telegram-login' {
  import { FC } from 'react';

  interface TelegramLoginButtonProps {
    botName: string;
    dataOnauth: (user: any) => void;
    buttonSize?: 'large' | 'medium' | 'small';
    cornerRadius?: number;
    requestAccess?: 'write';
    usePic?: boolean;
    lang?: string;
  }

  const TelegramLoginButton: FC<TelegramLoginButtonProps>;
  export default TelegramLoginButton;
}
