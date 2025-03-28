import axios from 'axios';
import { User, UserResponse, Post, PostResponse, Comment, CommentResponse } from '../types';

const API_BASE_URL = '/test'; 
const RANDOM_IMAGE_SIZE = 800;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Cache for storing data to minimize API calls
let userCache: Map<string, User> = new Map();
let postsCache: Map<string, Post[]> = new Map();
let commentsCache: Map<number, Comment[]> = new Map();
let lastUserFetch = 0;
let lastPostsFetch: { [key: string]: number } = {};
let lastCommentsFetch: { [key: number]: number } = {};
const CACHE_TTL = 10000; // 10 seconds cache TTL

const getRandomImage = (seed: string) => {
  return `https://picsum.photos/seed/${seed}/${RANDOM_IMAGE_SIZE}`;
};

const generateTimestamp = () => {
  return new Date().toISOString();
};

export const getUsers = async (): Promise<User[]> => {
  const now = Date.now();
  if (userCache.size && now - lastUserFetch < CACHE_TTL) {
    return Array.from(userCache.values());
  }

  try {
    const response = await api.get<UserResponse>('/users');
    const users = Object.entries(response.data.users).map(([id, username]) => ({
      id,
      username,
      avatarUrl: getRandomImage(id),
      postCount: 0 // Will be updated when fetching posts
    }));

    // Update user cache
    userCache = new Map(users.map(user => [user.id, user]));
    lastUserFetch = now;

    // Fetch post counts for each user
    await Promise.all(
      users.map(async user => {
        try {
          const posts = await getUserPosts(user.id);
          const cachedUser = userCache.get(user.id);
          if (cachedUser) {
            cachedUser.postCount = posts.length;
            userCache.set(user.id, cachedUser);
          }
        } catch (error) {
          console.error(`Error fetching posts for user ${user.id}:`, error);
        }
      })
    );

    return Array.from(userCache.values());
  } catch (error) {
    console.error('Error fetching users:', error);
    if (userCache.size) {
      return Array.from(userCache.values());
    }
    throw error;
  }
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  const now = Date.now();
  if (postsCache.has(userId) && lastPostsFetch[userId] && now - lastPostsFetch[userId] < CACHE_TTL) {
    return postsCache.get(userId) || [];
  }

  try {
    const response = await api.get<PostResponse>(`/users/${userId}/posts`);
    const posts = await Promise.all(response.data.posts.map(async post => {
      const comments = await getPostComments(post.id);
      return {
        ...post,
        imageUrl: getRandomImage(post.id.toString()),
        timestamp: generateTimestamp(),
        commentCount: comments.length
      };
    }));

    postsCache.set(userId, posts);
    lastPostsFetch[userId] = now;
    return posts;
  } catch (error) {
    console.error(`Error fetching posts for user ${userId}:`, error);
    return postsCache.get(userId) || [];
  }
};

export const getPostComments = async (postId: number): Promise<Comment[]> => {
  const now = Date.now();
  if (commentsCache.has(postId) && lastCommentsFetch[postId] && now - lastCommentsFetch[postId] < CACHE_TTL) {
    return commentsCache.get(postId) || [];
  }

  try {
    const response = await api.get<CommentResponse>(`/posts/${postId}/comments`);
    const comments = response.data.comments.map(comment => ({
      ...comment,
      timestamp: generateTimestamp()
    }));

    commentsCache.set(postId, comments);
    lastCommentsFetch[postId] = now;
    return comments;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    return commentsCache.get(postId) || [];
  }
};

export const getAllPosts = async (): Promise<Post[]> => {
  try {
    const users = await getUsers();
    const allPosts = await Promise.all(
      users.map(user => getUserPosts(user.id))
    );
    return allPosts.flat().sort((a, b) => 
      new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  } catch (error) {
    console.error('Error fetching all posts:', error);
    return [];
  }
};
