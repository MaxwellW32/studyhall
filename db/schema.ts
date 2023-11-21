import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, primaryKey, varchar, text, date, int, datetime, longtext, PrimaryKey } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"
import { relations } from 'drizzle-orm';


export const users = mysqlTable("users", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
    communitiesMade: many(communities),
    studySessionsMade: many(studySessions),
    communitiesJoined: many(usersToCommunities),
    studySessionsJoined: many(usersToStudySessions)
}));






export const communities = mysqlTable("communities", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    userId: text("user_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
});

export const communitiesRelations = relations(communities, ({ one, many }) => ({
    createdBy: one(users, {
        fields: [communities.userId],
        references: [users.id],
    }),
    posts: many(posts),
    members: many(usersToCommunities),
    tags: many(tagsToCommunities)
}));






export const studySessions = mysqlTable("studysessions", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    authorizedMemberList: text("authorized_member_list")
});

export const studySessionsRelations = relations(studySessions, ({ one, many }) => ({
    createdBy: one(users, {
        fields: [studySessions.userId],
        references: [users.id],
    }),
    posts: many(posts),
    members: many(usersToStudySessions),
}));






export const tags = mysqlTable("tags", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
    forCommunity: many(tagsToCommunities),
    forPosts: many(tagsToPosts),
}));







export const posts = mysqlTable("posts", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    communityId: varchar("community_id", { length: 255 }),
    studySessionId: varchar("study_session_id", { length: 255 }),
    likes: int("likes"),
    datePosted: datetime("date_posted").notNull(),
    message: longtext("message"),
    videoUrls: text("video_urls"),
    imageUrls: text("image_urls"),
},
    (table) => {
        return {
            communityIdIdx: index("community_id_index").on(table.communityId),
            studySessionIdIdx: index("study_session_id_index").on(table.studySessionId),
        }
    });

export const postsRelations = relations(posts, ({ many, one }) => ({
    author: one(users, {
        fields: [posts.userId],
        references: [users.id],
    }),
    forCommunity: one(communities, {
        fields: [posts.communityId],
        references: [communities.id],
    }),
    forStudySession: one(studySessions, {
        fields: [posts.studySessionId],
        references: [studySessions.id],
    }),
    tags: many(tagsToPosts),
    replies: many(comments)
}));









export const comments = mysqlTable("comments", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    postId: varchar("post_id", { length: 255 }).notNull(),
    datePosted: datetime("date_posted").notNull(),
    message: varchar("message", { length: 255 }).notNull(),
    likes: int("likes"),
},
    (table) => {
        return {
            commentsPostIdIdx: index("comments_post_id_index").on(table.postId),
        }
    });

export const commentsRelations = relations(comments, ({ one }) => ({
    parentPost: one(posts, {
        fields: [comments.postId],
        references: [posts.id],
    })
}));































//many to many pairings


export const usersToCommunities = mysqlTable('users_to_communities', {
    userId: varchar("user_id", { length: 255 }).notNull(),
    communityId: varchar("community_id", { length: 255 }).notNull(),
},
    (table) => {
        return {
            pk: primaryKey({ columns: [table.userId, table.communityId] })
        }
    });

export const usersToCommunitiesRelations = relations(usersToCommunities, ({ one }) => ({
    user: one(users, {
        fields: [usersToCommunities.userId],
        references: [users.id],
    }),
    community: one(communities, {
        fields: [usersToCommunities.communityId],
        references: [communities.id],
    }),
}));







export const usersToStudySessions = mysqlTable('users_to_study_sessions', {
    userId: varchar("user_id", { length: 255 }).notNull(),
    studySessionId: varchar("study_session_id", { length: 255 }).notNull(),
},
    (table) => {
        return {
            pk: primaryKey({ columns: [table.userId, table.studySessionId] })
        }
    });

export const usersToStudySessionsRelations = relations(usersToStudySessions, ({ one }) => ({
    user: one(users, {
        fields: [usersToStudySessions.userId],
        references: [users.id],
    }),
    studySession: one(studySessions, {
        fields: [usersToStudySessions.studySessionId],
        references: [studySessions.id],
    }),
}));









export const tagsToCommunities = mysqlTable('tags_to_communities', {
    tagId: varchar("tag_id", { length: 255 }).notNull(),
    communityId: varchar("community_id", { length: 255 }).notNull(),
},
    (table) => {
        return {
            pk: primaryKey({ columns: [table.tagId, table.communityId] })
        }
    });

export const tagsToCommunitiesRelations = relations(tagsToCommunities, ({ one }) => ({
    tag: one(tags, {
        fields: [tagsToCommunities.tagId],
        references: [tags.id],
    }),
    community: one(communities, {
        fields: [tagsToCommunities.communityId],
        references: [communities.id],
    }),
}));









export const tagsToPosts = mysqlTable('tags_to_posts', {
    tagId: varchar("tag_id", { length: 255 }).notNull(),
    postId: varchar("post_id", { length: 255 }).notNull(),
},
    (table) => {
        return {
            pk: primaryKey({ columns: [table.tagId, table.postId] })
        }
    });

export const tagsToPostsRelations = relations(tagsToPosts, ({ one }) => ({
    tag: one(tags, {
        fields: [tagsToPosts.tagId],
        references: [tags.id],
    }),
    post: one(posts, {
        fields: [tagsToPosts.postId],
        references: [posts.id],
    }),
}));