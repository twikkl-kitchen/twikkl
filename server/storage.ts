// Storage layer for database operations
import {
  users,
  servers,
  serverMembers,
  videos,
  uploadCounts,
  referrals,
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
} from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, sql } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
