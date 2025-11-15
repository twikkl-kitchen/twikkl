# Telegram OAuth Setup Guide

## Overview
Twikkl now supports "Sign up with Telegram" allowing users to authenticate using their Telegram account. When users sign up via Telegram, their Telegram username is automatically imported.

## Setup Instructions

### 1. Create a Telegram Bot
1. Open Telegram and search for **@BotFather**
2. Start a chat and send `/newbot`
3. Follow the prompts to create your bot:
   - Choose a name for your bot (e.g., "Twikkl")
   - Choose a username (e.g., "twikkl_bot")
4. **Save the bot token** - it looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### 2. Configure the Bot for Web Login
1. In your chat with @BotFather, send `/setdomain`
2. Select your bot from the list
3. Enter your domain:
   - **For production**: `your-domain.com` (must be HTTPS)
   - **For Replit development**: Your Replit app URL (e.g., `your-repl.repl.co`)
   - **For local development**: Use ngrok or similar to expose localhost

### 3. Add Bot Token to Replit Secrets
1. In Replit, click **Tools** → **Secrets**
2. Add a new secret:
   - Key: `TELEGRAM_BOT_TOKEN`
   - Value: Your bot token from step 1
3. Click **Add Secret**

### 4. Configure Bot Username (Optional)
If your bot username is different from `twikkl_bot`, add it as an environment variable:
1. In Replit, click **Tools** → **Secrets**
2. Add a new secret:
   - Key: `EXPO_PUBLIC_TELEGRAM_BOT_NAME`
   - Value: Your bot username (without the @)

### 5. Test the Integration
1. Restart your backend server (it will pick up the new secret)
2. Visit your app's signup page
3. You should see a "Telegram Login" button (only visible on web)
4. Click it to test the Telegram authentication flow

## How It Works

### User Flow
1. User clicks "Login with Telegram" button on signup page
2. Telegram widget opens for authentication
3. User approves login in Telegram
4. Telegram sends encrypted auth data to your app
5. Backend verifies the data using HMAC signature
6. User is created/logged in with their Telegram username
7. User is redirected to home screen

### Technical Implementation
- **Frontend**: Uses `react-telegram-login` widget (web-only)
- **Backend**: Validates auth data using `@telegram-auth/server`
- **Security**: HMAC signature verification ensures data authenticity
- **Database**: Creates user with `telegram_${telegram_id}` as unique ID

## User Data Received
When a user logs in via Telegram, you receive:
- `id` - Telegram user ID
- `username` - Telegram username (used automatically)
- `first_name` - First name
- `last_name` - Last name (optional)
- `photo_url` - Profile photo URL

## Important Notes
1. **Web Only**: Telegram login widget only works on web platform, not mobile apps
2. **HTTPS Required**: Production domain must use HTTPS
3. **Domain Registration**: Must register domain with @BotFather
4. **Automatic Username**: Users who sign up via Telegram skip the username creation step since their Telegram username is imported automatically

## Troubleshooting

### "Telegram bot token not configured" error
- Make sure `TELEGRAM_BOT_TOKEN` secret is added in Replit
- Restart the backend server after adding the secret

### Telegram widget not appearing
- Check that you're on web platform (not mobile)
- Verify bot username is correct
- Make sure frontend is running on the correct domain registered with @BotFather

### Authentication fails
- Verify bot token is correct
- Check that domain is registered with @BotFather using `/setdomain`
- Look at backend logs for specific error messages

## API Endpoint
The Telegram authentication endpoint is:
```
POST /api/auth/telegram
```

Request body: Telegram auth data (sent automatically by the widget)

Response:
```json
{
  "success": true,
  "user": {
    "id": "telegram_123456789",
    "username": "user_telegram_username",
    "email": "telegram_123456789@telegram.user",
    "profileImage": "https://..."
  }
}
```

## For More Information
- [Telegram Login Widget Documentation](https://core.telegram.org/widgets/login)
- [@BotFather Documentation](https://core.telegram.org/bots/features#botfather)
