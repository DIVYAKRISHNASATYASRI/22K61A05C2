import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Avatar, CardHeader, CircularProgress, Alert } from '@mui/material';
import { getAllPosts } from '../services/api';
import { Post } from '../types';

const REFRESH_INTERVAL = 10000; // 10 seconds

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const fetchedPosts = await getAllPosts();
      setPosts(fetchedPosts);
      setError(null);
    } catch (err) {
      setError('Failed to fetch posts. Will try again soon.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Feed
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {posts.map((post) => (
        <Card key={post.id} sx={{ mb: 3, '&:hover': { boxShadow: 6 } }}>
          <CardHeader
            avatar={<Avatar src={`https://i.pravatar.cc/150?u=${post.userid}`} />}
            title={`User ${post.userid}`}
            subheader={post.timestamp && new Date(post.timestamp).toLocaleString()}
          />
          {post.imageUrl && (
            <CardMedia
              component="img"
              height="300"
              image={post.imageUrl}
              alt="Post image"
              sx={{ objectFit: 'cover' }}
            />
          )}
          <CardContent>
            <Typography variant="body1" paragraph>
              {post.content}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {post.commentCount || 0} comments
            </Typography>
          </CardContent>
        </Card>
      ))}

      {posts.length === 0 && !error && (
        <Typography variant="body1" color="text.secondary" align="center">
          No posts available
        </Typography>
      )}
    </Box>
  );
};

export default Feed;
