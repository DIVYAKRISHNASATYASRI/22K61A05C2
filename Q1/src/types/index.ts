export interface UserResponse {
  users: {
    [key: string]: string;
  };
}

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  postCount: number;
}

export interface Post {
  id: number;
  userid: number;
  content: string;
  imageUrl?: string;
  timestamp?: string;
  commentCount?: number;
}

export interface PostResponse {
  posts: Post[];
}

export interface Comment {
  id: number;
  postid: number;
  content: string;
  timestamp?: string;
}

export interface CommentResponse {
  comments: Comment[];
}
