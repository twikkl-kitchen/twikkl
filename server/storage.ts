// Storage layer for database operations
import {
  users,
  servers,
  serverMembers,
  videos,
  uploadCounts,
  referrals,
  comments,
  likes,
  follows,
  videoViews,
  type User,
  type UpsertUser,
  type InsertServer,
  type Server,
  type InsertServerMember,
  type ServerMember,
  type InsertVideo,
  type Video,
  type InsertUploadCount,
  type UploadCount,
  type InsertReferral,
  type Referral,
  type InsertComment,
  type Comment,
  type InsertLike,
  type Like,
  type InsertFollow,
  type Follow,
  type InsertVideoView,
  type VideoView,
} from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, sql, or, ilike, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;
  
  // Server operations
  createServer(server: InsertServer): Promise<Server>;
  getServer(id: string): Promise<Server | undefined>;
  getUserServers(userId: string): Promise<Server[]>;
  updateServer(id: string, data: Partial<InsertServer>): Promise<Server | undefined>;
  deleteServer(id: string): Promise<void>;
  
  // Server member operations
  addServerMember(member: InsertServerMember): Promise<ServerMember>;
  removeServerMember(serverId: string, userId: string): Promise<void>;
  getServerMembers(serverId: string): Promise<ServerMember[]>;
  isServerMember(serverId: string, userId: string): Promise<boolean>;
  isServerAdmin(serverId: string, userId: string): Promise<boolean>;
  updateServerMemberRole(serverId: string, userId: string, role: string): Promise<ServerMember | undefined>;
  
  // Video operations
  createVideo(video: InsertVideo): Promise<Video>;
  getVideo(id: string): Promise<Video | undefined>;
  getServerVideos(serverId: string): Promise<Video[]>;
  getUserVideos(userId: string): Promise<Video[]>;
  updateVideo(id: string, data: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: string): Promise<void>;
  
  // Upload count operations (24h limit)
  recordUpload(userId: string, serverId: string): Promise<UploadCount>;
  getRecentUploadCount(userId: string, serverId: string, hours: number): Promise<number>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralsByReferrer(referrerId: string): Promise<Referral[]>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  updateReferralStatus(id: string, status: string): Promise<void>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getVideoComments(videoId: string): Promise<Comment[]>;
  deleteComment(id: string): Promise<void>;
  
  // Like operations
  toggleLike(videoId: string, userId: string): Promise<{ liked: boolean; likeCount: number }>;
  isVideoLiked(videoId: string, userId: string): Promise<boolean>;
  getVideoLikeCount(videoId: string): Promise<number>;
  
  // Follow operations
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  getFollowerCount(userId: string): Promise<number>;
  getFollowingCount(userId: string): Promise<number>;
  
  // Video view operations
  recordView(view: InsertVideoView): Promise<VideoView>;
  getVideoViewCount(videoId: string): Promise<number>;
  updateViewCount(videoId: string): Promise<void>;
  
  // Search operations
  searchVideos(query: string, limit?: number): Promise<Video[]>;
  searchServers(query: string, limit?: number): Promise<Server[]>;
  searchUsers(query: string, limit?: number): Promise<User[]>;
  
  // Following feed
  getFollowingFeed(userId: string, limit?: number): Promise<Video[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Server operations
  async createServer(serverData: InsertServer): Promise<Server> {
    const [server] = await db.insert(servers).values(serverData).returning();
    return server;
  }

  async getServer(id: string): Promise<Server | undefined> {
    const [server] = await db.select().from(servers).where(eq(servers.id, id));
    return server;
  }

  async getUserServers(userId: string): Promise<Server[]> {
    const userServers = await db
      .select({
        server: servers,
      })
      .from(serverMembers)
      .innerJoin(servers, eq(serverMembers.serverId, servers.id))
      .where(eq(serverMembers.userId, userId));
    
    return userServers.map(s => s.server);
  }

  async updateServer(id: string, data: Partial<InsertServer>): Promise<Server | undefined> {
    const [server] = await db
      .update(servers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(servers.id, id))
      .returning();
    return server;
  }

  async deleteServer(id: string): Promise<void> {
    await db.delete(servers).where(eq(servers.id, id));
  }

  // Server member operations
  async addServerMember(memberData: InsertServerMember): Promise<ServerMember> {
    const [member] = await db.insert(serverMembers).values(memberData).returning();
    return member;
  }

  async removeServerMember(serverId: string, userId: string): Promise<void> {
    await db
      .delete(serverMembers)
      .where(and(
        eq(serverMembers.serverId, serverId),
        eq(serverMembers.userId, userId)
      ));
  }

  async getServerMembers(serverId: string): Promise<ServerMember[]> {
    return await db
      .select()
      .from(serverMembers)
      .where(eq(serverMembers.serverId, serverId));
  }

  async isServerMember(serverId: string, userId: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(serverMembers)
      .where(and(
        eq(serverMembers.serverId, serverId),
        eq(serverMembers.userId, userId)
      ));
    return !!member;
  }

  async isServerAdmin(serverId: string, userId: string): Promise<boolean> {
    // Check if user is owner
    const server = await this.getServer(serverId);
    if (server?.ownerId === userId) {
      return true;
    }
    
    // Check if user is admin
    const [member] = await db
      .select()
      .from(serverMembers)
      .where(and(
        eq(serverMembers.serverId, serverId),
        eq(serverMembers.userId, userId)
      ));
    
    return member?.role === 'admin' || member?.role === 'owner';
  }

  async updateServerMemberRole(serverId: string, userId: string, role: string): Promise<ServerMember | undefined> {
    const [member] = await db
      .update(serverMembers)
      .set({ role })
      .where(and(
        eq(serverMembers.serverId, serverId),
        eq(serverMembers.userId, userId)
      ))
      .returning();
    return member;
  }

  // Video operations
  async createVideo(videoData: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos).values(videoData).returning();
    return video;
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async getServerVideos(serverId: string): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(eq(videos.serverId, serverId))
      .orderBy(desc(videos.createdAt));
  }

  async getUserVideos(userId: string): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(eq(videos.userId, userId))
      .orderBy(desc(videos.createdAt));
  }

  async updateVideo(id: string, data: Partial<InsertVideo>): Promise<Video | undefined> {
    const [video] = await db
      .update(videos)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning();
    return video;
  }

  async deleteVideo(id: string): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  // Upload count operations
  async recordUpload(userId: string, serverId: string): Promise<UploadCount> {
    const [record] = await db
      .insert(uploadCounts)
      .values({ userId, serverId })
      .returning();
    return record;
  }

  async getRecentUploadCount(userId: string, serverId: string, hours: number): Promise<number> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(uploadCounts)
      .where(and(
        eq(uploadCounts.userId, userId),
        eq(uploadCounts.serverId, serverId),
        gte(uploadCounts.uploadedAt, hoursAgo)
      ));
    
    return Number(result[0]?.count || 0);
  }

  // Referral operations
  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const [referral] = await db.insert(referrals).values(referralData).returning();
    return referral;
  }

  async getReferralsByReferrer(referrerId: string): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, referrerId))
      .orderBy(desc(referrals.createdAt));
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return user;
  }

  async updateReferralStatus(id: string, status: string): Promise<void> {
    await db
      .update(referrals)
      .set({ status, completedAt: status === 'completed' ? new Date() : undefined })
      .where(eq(referrals.id, id));
  }

  // Comment operations
  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }

  async getVideoComments(videoId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.videoId, videoId))
      .orderBy(desc(comments.createdAt));
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  // Like operations
  async toggleLike(videoId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    // Check if like exists
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(and(
        eq(likes.videoId, videoId),
        eq(likes.userId, userId)
      ));

    if (existingLike) {
      // Unlike - delete the like
      await db
        .delete(likes)
        .where(and(
          eq(likes.videoId, videoId),
          eq(likes.userId, userId)
        ));
      
      // Update video like count
      await this.updateVideoLikeCount(videoId);
      
      const likeCount = await this.getVideoLikeCount(videoId);
      return { liked: false, likeCount };
    } else {
      // Like - insert new like
      await db.insert(likes).values({ videoId, userId });
      
      // Update video like count
      await this.updateVideoLikeCount(videoId);
      
      const likeCount = await this.getVideoLikeCount(videoId);
      return { liked: true, likeCount };
    }
  }

  async isVideoLiked(videoId: string, userId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(
        eq(likes.videoId, videoId),
        eq(likes.userId, userId)
      ));
    return !!like;
  }

  async getVideoLikeCount(videoId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(likes)
      .where(eq(likes.videoId, videoId));
    return Number(result[0]?.count || 0);
  }

  private async updateVideoLikeCount(videoId: string): Promise<void> {
    const likeCount = await this.getVideoLikeCount(videoId);
    await db
      .update(videos)
      .set({ likeCount })
      .where(eq(videos.id, videoId));
  }

  // Follow operations
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, followingId })
      .returning();
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ));
    return !!follow;
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followers = await db
      .select({
        user: users,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
    
    return followers.map(f => f.user);
  }

  async getFollowing(userId: string): Promise<User[]> {
    const following = await db
      .select({
        user: users,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
    
    return following.map(f => f.user);
  }

  async getFollowerCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, userId));
    return Number(result[0]?.count || 0);
  }

  async getFollowingCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, userId));
    return Number(result[0]?.count || 0);
  }

  // Video view operations
  async recordView(viewData: InsertVideoView): Promise<VideoView> {
    const [view] = await db.insert(videoViews).values(viewData).returning();
    
    // Update video view count
    await this.updateViewCount(viewData.videoId);
    
    return view;
  }

  async getVideoViewCount(videoId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(videoViews)
      .where(eq(videoViews.videoId, videoId));
    return Number(result[0]?.count || 0);
  }

  async updateViewCount(videoId: string): Promise<void> {
    const viewCount = await this.getVideoViewCount(videoId);
    await db
      .update(videos)
      .set({ viewCount })
      .where(eq(videos.id, videoId));
  }

  // Search operations
  async searchVideos(query: string, limit: number = 20): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(or(
        ilike(videos.caption, `%${query}%`),
        ilike(videos.category, `%${query}%`)
      ))
      .orderBy(desc(videos.createdAt))
      .limit(limit);
  }

  async searchServers(query: string, limit: number = 20): Promise<Server[]> {
    return await db
      .select()
      .from(servers)
      .where(or(
        ilike(servers.name, `%${query}%`),
        ilike(servers.description, `%${query}%`),
        ilike(servers.hashtags, `%${query}%`)
      ))
      .orderBy(desc(servers.createdAt))
      .limit(limit);
  }

  async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(or(
        ilike(users.username, `%${query}%`),
        ilike(users.email, `%${query}%`),
        ilike(users.firstName, `%${query}%`),
        ilike(users.lastName, `%${query}%`)
      ))
      .limit(limit);
  }

  // Following feed
  async getFollowingFeed(userId: string, limit: number = 50): Promise<Video[]> {
    // Get list of users that this user follows
    const followingUsers = await db
      .select({ userId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    
    const followingIds = followingUsers.map(f => f.userId);
    
    if (followingIds.length === 0) {
      return [];
    }
    
    // Get videos from those users
    return await db
      .select()
      .from(videos)
      .where(inArray(videos.userId, followingIds))
      .orderBy(desc(videos.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
