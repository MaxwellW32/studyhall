import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, timestamp, primaryKey, varchar, text, date, int, datetime, longtext, PrimaryKey, bigint, uniqueIndex, boolean } from "drizzle-orm/mysql-core"
import { relations } from 'drizzle-orm';

//gotta delete related databse records on deletion


export const users = mysqlTable("users", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date", fsp: 3 }).defaultNow(),
    image: varchar("image", { length: 255 }),
    username: varchar("username", { length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
    educationLevel: varchar("education_level", { length: 255 }),
    fieldOfStudy: varchar("field_of_study", { length: 255 }),
    country: varchar("country", { length: 255 }),
    interests: text("interests"),
},
    (table) => {
        return {
            usernameIdx: index("username_index").on(table.username),
            userIdIdx: index("user_id_index").on(table.id),
            emailIdx: uniqueIndex('users_email_index').on(table.email),
        }
    });

export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
    communitiesMade: many(communities),

    studySessionsMade: many(studySessions),
    communitiesJoined: many(usersToCommunities),

    studySessionsJoined: many(usersToStudySessions),

    comments: many(comments),

    likedPosts: many(usersToLikedPosts),
    likedComments: many(usersToLikedComments),
    likedReplies: many(usersToLikedReplies),

    replies: many(replies, { relationName: "fromUser" }),
}));






//auth
export const accounts = mysqlTable(
    'accounts',
    {
        id: varchar('id', { length: 255 }).primaryKey().notNull(),
        userId: varchar('userId', { length: 255 }).notNull(),
        type: varchar('type', { length: 255 }).notNull(),
        provider: varchar('provider', { length: 255 }).notNull(),
        providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
        access_token: text('access_token'),
        expires_in: int('expires_in'),
        id_token: text('id_token'),
        refresh_token: text('refresh_token'),
        refresh_token_expires_in: int('refresh_token_expires_in'),
        scope: varchar('scope', { length: 255 }),
        token_type: varchar('token_type', { length: 255 }),
        createdAt: timestamp('createdAt').defaultNow().notNull(),
        updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
    },
    account => ({
        providerProviderAccountIdIndex: uniqueIndex(
            'accounts__provider__providerAccountId__idx'
        ).on(account.provider, account.providerAccountId),
        userIdIndex: index('accounts__userId__idx').on(account.userId),
    })
);

export const sessions = mysqlTable(
    'sessions',
    {
        id: varchar('id', { length: 255 }).primaryKey().notNull(),
        sessionToken: varchar('sessionToken', { length: 255 }).notNull(),
        userId: varchar('userId', { length: 255 }).notNull(),
        expires: datetime('expires').notNull(),
        created_at: timestamp('created_at').notNull().defaultNow(),
        updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
    },
    session => ({
        sessionTokenIndex: uniqueIndex('sessions__sessionToken__idx').on(
            session.sessionToken
        ),
        userIdIndex: index('sessions__userId__idx').on(session.userId),
    })
);

export const verificationTokens = mysqlTable(
    'verification_tokens',
    {
        identifier: varchar('identifier', { length: 255 }).primaryKey().notNull(),
        token: varchar('token', { length: 255 }).notNull(),
        expires: datetime('expires').notNull(),
        created_at: timestamp('created_at').notNull().defaultNow(),
        updated_at: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
    },
    verificationToken => ({
        tokenIndex: uniqueIndex('verification_tokens__token__idx').on(
            verificationToken.token
        ),
    })
);












export const communities = mysqlTable("communities", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    userId: text("user_id").notNull(),
    memberCount: int("member_count").default(0).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
},
    (table) => {
        return {
            memberCountIdx: index("member_count_index").on(table.memberCount),
        }
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


// export type communityTest = typeof communities.$inferSelect;
// export type userTest = typeof users.$inferSelect;
export type postTest = typeof posts.$inferSelect;










export const studySessions = mysqlTable("studysessions", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    authorizedMemberList: text("authorized_member_list"),
    allowAll: boolean("allow_all").notNull().default(false),
    isPublic: boolean("is_public").notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow()
},
    (table) => {
        return {
            userIdIdx: index("user_id_index").on(table.userId),
            nameIdx: index("name_index").on(table.name),
        }
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
    title: varchar("title", { length: 255 }).notNull(),
    communityId: varchar("community_id", { length: 255 }),
    studySessionId: varchar("study_session_id", { length: 255 }),
    likes: int("likes").default(0).notNull(),
    datePosted: datetime("date_posted").notNull(),
    message: longtext("message"),
    videoUrls: text("video_urls"),
    imageUrls: text("image_urls"),
},
    (table) => {
        return {
            communityIdIdx: index("community_id_index").on(table.communityId),
            studySessionIdIdx: index("study_session_id_index").on(table.studySessionId),
            postLikesIdx: index("post_likes_index").on(table.likes),
            postDatePostedIdx: index("post_date_posted_index").on(table.datePosted),
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
    comments: many(comments),
    likedByUsers: many(usersToLikedPosts),
}));









export const comments = mysqlTable("comments", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    postId: varchar("post_id", { length: 255 }).notNull(),
    datePosted: datetime("date_posted").notNull(),
    message: varchar("message", { length: 255 }).notNull(),
    likes: int("likes").default(0).notNull(),
},
    (table) => {
        return {
            commentsPostIdIdx: index("comments_post_id_index").on(table.postId),
            commentLikesIdx: index("comment_likes_index").on(table.likes),
        }
    });

export const commentsRelations = relations(comments, ({ one, many }) => ({
    parentPost: one(posts, {
        fields: [comments.postId],
        references: [posts.id],
    }),
    fromUser: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
    replies: many(replies),
    likedByUsers: many(usersToLikedComments),
}));













export const replies = mysqlTable("replies", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    replyingToUserId: varchar("replying_to_user_id", { length: 255 }).notNull(),
    commentId: varchar("comment_id", { length: 255 }).notNull(),
    datePosted: datetime("date_posted").notNull(),
    message: varchar("message", { length: 255 }).notNull(),
    likes: int("likes").default(0).notNull(),
},
    (table) => {
        return {
            commentIdIdx: index("comment_id_idx").on(table.commentId),
            replyLikesIdx: index("reply_likes_index").on(table.likes),
        }
    });

export const repliesRelations = relations(replies, ({ one, many }) => ({
    fromComment: one(comments, {
        fields: [replies.commentId],
        references: [comments.id],
    }),
    fromUser: one(users, {
        fields: [replies.userId],
        references: [users.id],
        relationName: 'fromUser'
    }),
    replyingToUser: one(users, {
        fields: [replies.replyingToUserId],
        references: [users.id],
        relationName: 'replyingToUser'
    }),
    likedByUsers: many(usersToLikedReplies),
}));






























//many to many pairings


export const usersToCommunities = mysqlTable('users_to_communities', {
    userId: varchar("user_id", { length: 255 }).notNull(),
    communityId: varchar("community_id", { length: 255 }).notNull(),
},
    (table) => {
        return {
            pk: primaryKey({ columns: [table.userId, table.communityId] }),
            communityIdIdx: index("community_id_index").on(table.communityId),
            userIdIdx: index("user_id_index").on(table.userId),
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
            pk: primaryKey({ columns: [table.userId, table.studySessionId] }),
            studySessionIdIdx: index("study_session_id_index").on(table.studySessionId),
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







export const usersToLikedPosts = mysqlTable('users_to_liked_posts', {
    userId: varchar("user_id", { length: 255 }).notNull(),
    postId: varchar("post_id", { length: 255 }).notNull(),
},
    (table) => {
        return {
            pk: primaryKey({ columns: [table.userId, table.postId] }),
            userIdIndex: index('userId_idx').on(table.userId)
        }
    });

export const usersToLikedPostsRelations = relations(usersToLikedPosts, ({ one }) => ({
    user: one(users, {
        fields: [usersToLikedPosts.userId],
        references: [users.id],
    }),
    post: one(posts, {
        fields: [usersToLikedPosts.postId],
        references: [posts.id],
    }),
}));






export const usersToLikedComments = mysqlTable('users_to_liked_comments', {
    userId: varchar("user_id", { length: 255 }).notNull(),
    commentId: varchar("comment_id", { length: 255 }).notNull(),
},
    (table) => {
        return {
            pk: primaryKey({ columns: [table.userId, table.commentId] }),
            userIdIndex: index('userId_idx').on(table.userId)
        }
    });

export const usersToLikedCommentsRelations = relations(usersToLikedComments, ({ one }) => ({
    user: one(users, {
        fields: [usersToLikedComments.userId],
        references: [users.id],
    }),
    comment: one(comments, {
        fields: [usersToLikedComments.commentId],
        references: [comments.id],
    }),
}));







export const usersToLikedReplies = mysqlTable('users_to_liked_replies', {
    userId: varchar("user_id", { length: 255 }).notNull(),
    replyId: varchar("reply_id", { length: 255 }).notNull(),
},
    (table) => {
        return {
            pk: primaryKey({ columns: [table.userId, table.replyId] }),
            userIdIndex: index('userId_idx').on(table.userId)
        }
    });

export const usersToLikedRepliesRelations = relations(usersToLikedReplies, ({ one }) => ({
    user: one(users, {
        fields: [usersToLikedReplies.userId],
        references: [users.id],
    }),
    reply: one(replies, {
        fields: [usersToLikedReplies.replyId],
        references: [replies.id],
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