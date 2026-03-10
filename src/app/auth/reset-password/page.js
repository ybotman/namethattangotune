'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { AuthContext } from '@/contexts/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockResetIcon from '@mui/icons-material/LockReset';
import Link from 'next/link';

const ResetPasswordPage = () => {
  const router = useRouter();
  const { resetPassword } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border-color)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Back navigation */}
            <Box sx={{ alignSelf: 'flex-start', width: '100%', mb: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/auth/login')}
                sx={{
                  textTransform: 'none',
                  color: 'var(--foreground)',
                }}
              >
                Back to Login
              </Button>
            </Box>

            {/* Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <LockResetIcon sx={{ fontSize: 48, color: 'var(--accent)', mr: 2 }} />
              <Typography
                component="h1"
                variant="h5"
                sx={{ fontWeight: 'bold', color: 'var(--accent)' }}
              >
                Reset Password
              </Typography>
            </Box>

            {success ? (
              <Box sx={{ textAlign: 'center' }}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Password reset email sent! Check your inbox.
                </Alert>
                <Typography variant="body1" sx={{ color: 'var(--foreground)', mb: 3 }}>
                  We've sent a password reset link to <strong>{email}</strong>.
                  Click the link in the email to reset your password.
                </Typography>
                <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: 'var(--accent)',
                      '&:hover': { opacity: 0.9 },
                    }}
                  >
                    Return to Login
                  </Button>
                </Link>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <Typography
                  variant="body1"
                  sx={{ color: 'var(--foreground)', mb: 3, textAlign: 'center' }}
                >
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ backgroundColor: 'var(--input-bg)', mb: 2 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    backgroundColor: 'var(--accent)',
                    '&:hover': { opacity: 0.9 },
                  }}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
