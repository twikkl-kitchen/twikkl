// Database schema for Twikkl platform
// Using Drizzle ORM with PostgreSQL

import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  username: varchar("username", { length: 50 }).unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  referralCode: varchar("referral_code", { length: 10 }).unique(),
  referredBy: varchar("referred_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Servers table - Community servers
export const servers = pgTable("servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 100 }),
  hashtags: text("hashtags"), // JSON array stored as text
  categories: text("categories"), // JSON array of custom category names
  privacy: varchar("privacy", { length: 20 }).notNull().default('public'), // 'public' or 'private'
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  profileImageUrl: varchar("profile_image_url"),
  bannerImageUrl: varchar("banner_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type InsertServer = typeof servers.$inferInsert;
export type Server = typeof servers.$inferSelect;

// Server members table
export const serverMembers = pgTable("server_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar("role", { length: 20 }).notNull().default('member'), // 'owner', 'admin', 'member'
  isFavorite: boolean("is_favorite").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => [
  unique("unique_server_member").on(table.serverId, table.userId),
]);

export type InsertServerMember = typeof serverMembers.$inferInsert;
export type ServerMember = typeof serverMembers.$inferSelect;

// Videos table
export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  serverId: varchar("server_id").references(() => servers.id, { onDelete: 'set null' }),
  fileName: varchar("file_name").notNull(),
  videoUrl: varchar("video_url").notNull(), // URL in App Storage
  caption: text("caption"),
  category: varchar("category", { length: 50 }), // 'Tutorial', 'Trading', 'Development', 'General', 'News'
  visibility: varchar("visibility", { length: 20 }).notNull().default('public'), // 'Public', 'Followers', 'Private'
  fileSize: integer("file_size"), // in bytes
  duration: integer("duration"), // in seconds
  thumbnailUrl: varchar("thumbnail_url"),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type InsertVideo = typeof videos.$inferInsert;
export type Video = typeof videos.$inferSelect;

// Upload count tracking table - for 2 videos per 24h limit per server
export const uploadCounts = pgTable("upload_counts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: 'cascade' }),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
}, (table) => [
  index("idx_upload_counts_user_server").on(table.userId, table.serverId, table.uploadedAt),
]);

export type InsertUploadCount = typeof uploadCounts.$inferInsert;
export type UploadCount = typeof uploadCounts.$inferSelect;

// Referrals table - for tracking referral relationships and rewards
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'completed', 'rewarded'
  rewardType: varchar("reward_type", { length: 50 }), // 'bonus_upload', 'premium_feature', etc.
  rewardValue: text("reward_value"), // JSON data for reward details
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  unique("unique_referral").on(table.referredUserId),
  index("idx_referrals_referrer").on(table.referrerId),
]);

export type InsertReferral = typeof referrals.$inferInsert;
export type Referral = typeof referrals.$inferSelect;

// Comments table - for video comments
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").notNull().references(() => videos.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_comments_video").on(table.videoId),
  index("idx_comments_user").on(table.userId),
]);

export type InsertComment = typeof comments.$inferInsert;
export type Comment = typeof comments.$inferSelect;

// Likes table - for video likes
export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").notNull().references(() => videos.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_video_like").on(table.videoId, table.userId),
  index("idx_likes_video").on(table.videoId),
  index("idx_likes_user").on(table.userId),
]);

export type InsertLike = typeof likes.$inferInsert;
export type Like = typeof likes.$inferSelect;

// Follows table - for user follows
export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_follow").on(table.followerId, table.followingId),
  index("idx_follows_follower").on(table.followerId),
  index("idx_follows_following").on(table.followingId),
]);

export type InsertFollow = typeof follows.$inferInsert;
export type Follow = typeof follows.$inferSelect;

// Video views table - for tracking video views and watch time
export const videoViews = pgTable("video_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").notNull().references(() => videos.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'set null' }), // nullable for anonymous views
  watchDuration: integer("watch_duration").default(0), // in seconds
  completed: boolean("completed").default(false), // whether user watched to the end
  viewedAt: timestamp("viewed_at").defaultNow(),
}, (table) => [
  index("idx_video_views_video").on(table.videoId),
  index("idx_video_views_user").on(table.userId),
  index("idx_video_views_date").on(table.viewedAt),
]);

export type InsertVideoView = typeof videoViews.$inferInsert;
export type VideoView = typeof videoViews.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  serverMemberships: many(serverMembers),
  ownedServers: many(servers),
  referralsMade: many(referrals, { relationName: 'referrer' }),
  referralsReceived: many(referrals, { relationName: 'referred' }),
  comments: many(comments),
  likes: many(likes),
  following: many(follows, { relationName: 'follower' }),
  followers: many(follows, { relationName: 'following' }),
  videoViews: many(videoViews),
}));

export const serversRelations = relations(servers, ({ one, many }) => ({
  owner: one(users, {
    fields: [servers.ownerId],
    references: [users.id],
  }),
  members: many(serverMembers),
  videos: many(videos),
  uploadCounts: many(uploadCounts),
}));

export const serverMembersRelations = relations(serverMembers, ({ one }) => ({
  server: one(servers, {
    fields: [serverMembers.serverId],
    references: [servers.id],
  }),
  user: one(users, {
    fields: [serverMembers.userId],
    references: [users.id],
  }),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [videos.serverId],
    references: [servers.id],
  }),
  comments: many(comments),
  likes: many(likes),
  views: many(videoViews),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: 'referrer',
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: 'referred',
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  video: one(videos, {
    fields: [likes.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'follower',
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: 'following',
  }),
}));

export const videoViewsRelations = relations(videoViews, ({ one }) => ({
  video: one(videos, {
    fields: [videoViews.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [videoViews.userId],
    references: [users.id],
  }),
}));
