const { supabaseAdmin, supabaseUrl } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Upload video to Supabase Storage
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const userId = req.user.id;
    const file = req.file;
    const videoId = uuidv4();
    const fileName = `${userId}/${videoId}-${Date.now()}.mp4`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('videos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: 'Failed to upload video' });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('videos')
      .getPublicUrl(fileName);

    res.json({
      success: true,
      videoUrl: urlData.publicUrl,
      fileName: fileName
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create video post
const createVideoPost = async (req, res) => {
  try {
    const { videoUrl, caption, category, visibility, serverId, fileName } = req.body;
    const userId = req.user.id;

    const videoPost = {
      user_id: userId,
      server_id: serverId || null,
      video_url: videoUrl,
      file_name: fileName,
      caption: caption || '',
      category: category || 'General',
      visibility: visibility || 'Public',
      views: 0,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('videos')
      .insert([videoPost])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create video post' });
    }

    res.json({ success: true, video: data });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get videos for a server
const getServerVideos = async (req, res) => {
  try {
    const { serverId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('videos')
      .select(`
        *,
        user:users(id, first_name, last_name, profile_image_url)
      `)
      .eq('server_id', serverId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ videos: data || [] });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

// Get user's upload count in last 24 hours for a server
const getUploadCount = async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.user.id;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('server_id', serverId)
      .gte('created_at', twentyFourHoursAgo);

    if (error) throw error;

    res.json({ 
      count: data.length,
      uploads: data 
    });
  } catch (error) {
    console.error('Get upload count error:', error);
    res.status(500).json({ error: 'Failed to get upload count' });
  }
};

module.exports = {
  uploadVideo,
  createVideoPost,
  getServerVideos,
  getUploadCount
};
