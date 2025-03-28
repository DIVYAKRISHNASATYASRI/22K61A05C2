import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Avatar, CardHeader, CircularProgress, Alert } from '@mui/material';
import { getAllPosts } from '../services/api';
import { Post } from '../types';

const REFRESH_INTERVAL = 30000; // 30 seconds

const TrendingPosts: React.FC = () => {
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxComments, setMaxComments] = useState(0);

  const fetchTrendingPosts = useCallback(async () => {
    try {
      const posts = await getAllPosts();
      const max = Math.max(...posts.map(post => post.commentCount || 0));
      setMaxComments(max);
      const trending = posts.filter(post => (post.commentCount || 0) === max);
      setTrendingPosts(trending);
      setError(null);
    } catch (err) {
      setError('Failed to fetch trending posts. Will try again soon.');
      console.error('Error fetching trending posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingPosts();
    const interval = setInterval(fetchTrendingPosts, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchTrendingPosts]);

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
        Trending Posts
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Posts with {maxComments} comments
      </Typography>

      {trendingPosts.map((post) => (
        <Card key={post.id} sx={{ mb: 3, bgcolor: 'background.paper', '&:hover': { boxShadow: 6 } }}>
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
            <Typography variant="subtitle2" color="primary" fontWeight="bold">
              {post.commentCount || 0} comments
            </Typography>
          </CardContent>
        </Card>
      ))}

      {trendingPosts.length === 0 && !error && (
        <Typography variant="body1" color="text.secondary" align="center">
          No trending posts available
        </Typography>
      )}
    </Box>
  );
};

export default TrendingPosts;
