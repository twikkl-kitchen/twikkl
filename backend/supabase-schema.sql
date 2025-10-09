-- Twikkl Database Schema for Supabase

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Servers/Communities table
CREATE TABLE IF NOT EXISTS servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  hashtag VARCHAR(100),
  is_private BOOLEAN DEFAULT FALSE,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_image_url TEXT,
  banner_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  caption TEXT,
  category VARCHAR(50) DEFAULT 'General',
  visibility VARCHAR(20) DEFAULT 'Public',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server members table
CREATE TABLE IF NOT EXISTS server_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(server_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_server_id ON videos(server_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_server_members_server_id ON server_members(server_id);
CREATE INDEX IF NOT EXISTS idx_server_members_user_id ON server_members(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (anyone can read, only user can update own profile)
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for servers (public servers viewable by all, private need membership)
CREATE POLICY "Public servers are viewable by everyone" ON servers
  FOR SELECT USING (is_private = false OR owner_id::text = auth.uid()::text);

CREATE POLICY "Server owners can update their servers" ON servers
  FOR UPDATE USING (owner_id::text = auth.uid()::text);

CREATE POLICY "Anyone can create servers" ON servers
  FOR INSERT WITH CHECK (true);

-- RLS Policies for videos
CREATE POLICY "Videos are viewable based on visibility" ON videos
  FOR SELECT USING (
    visibility = 'Public' OR 
    user_id::text = auth.uid()::text OR
    visibility = 'Followers'
  );

CREATE POLICY "Users can insert their own videos" ON videos
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own videos" ON videos
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own videos" ON videos
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- RLS Policies for server members
CREATE POLICY "Server members are viewable by server members" ON server_members
  FOR SELECT USING (
    user_id::text = auth.uid()::text OR
    server_id IN (SELECT server_id FROM server_members WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "Users can join servers" ON server_members
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
