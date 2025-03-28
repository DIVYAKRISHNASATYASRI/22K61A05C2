import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, CircularProgress, Alert } from '@mui/material';
import { getUsers } from '../services/api';
import { User } from '../types';

const REFRESH_INTERVAL = 30000; // 30 seconds

const TopUsers: React.FC = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopUsers = useCallback(async () => {
    try {
      const users: User[] = await getUsers();
      const sortedUsers = users
        .sort((a: User, b: User) => b.postCount - a.postCount)
        .slice(0, 5);
      setTopUsers(sortedUsers);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch top users. Will try again soon.');
      console.error('Error fetching top users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopUsers();
    const interval = setInterval(fetchTopUsers, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchTopUsers]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Top Users
      </Typography>

      <List>
        {topUsers.map((user: User, index: number) => (
          <Card 
            key={user.id} 
            sx={{ 
              mb: 2,
              bgcolor: index === 0 ? 'primary.light' : 'background.paper',
              color: index === 0 ? 'primary.contrastText' : 'text.primary',
              '&:hover': { 
                boxShadow: 6,
                transform: 'scale(1.01)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            <CardContent>
              <ListItem>
                <ListItemAvatar>
                  <Avatar 
                    src={user.avatarUrl} 
                    alt={user.username}
                    sx={{ 
                      width: 56, 
                      height: 56,
                      border: index === 0 ? 2 : 0,
                      borderColor: 'primary.main'
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="h6">
                      {user.username}
                    </Typography>
                  }
                  secondary={
                    <Typography 
                      variant="subtitle1" 
                      color={index === 0 ? 'inherit' : 'text.secondary'}
                    >
                      {user.postCount} posts
                    </Typography>
                  }
                />
                <Typography 
                  variant="h4" 
                  color={index === 0 ? 'inherit' : 'primary'}
                  sx={{ fontWeight: 'bold' }}
                >
                  #{index + 1}
                </Typography>
              </ListItem>
            </CardContent>
          </Card>
        ))}
      </List>

      {topUsers.length === 0 && (
        <Typography variant="body1" color="text.secondary" align="center">
          No users available
        </Typography>
      )}
    </Box>
  );
};

export default TopUsers;
