'use client';

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import { AuthContext } from '@/contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginIcon from '@mui/icons-material/Login';
import AppleIcon from '@/components/AppleIcon';
import EmailAuthForm from '@/components/EmailAuthForm';
import Link from 'next/link';

const LoginPage = () => {
  const router = useRouter();
  const { user, loading, error, authenticateWithGoogle, authenticateWithApple, login } = useContext(AuthContext);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/games/gamehub');
    }
  }, [user, loading, router]);

  const handleGoogleLogIn = async () => {
    setIsRedirecting(true);
    setAuthError('');
    try {
      const result = await authenticateWithGoogle();
      if (result) {
        router.push('/games/gamehub');
      } else {
        setIsRedirecting(false);
      }
    } catch (error) {
      setAuthError(error.message);
      setIsRedirecting(false);
    }
  };

  const handleAppleLogIn = async () => {
    setIsRedirecting(true);
    setAuthError('');
    try {
      const result = await authenticateWithApple();
      if (result) {
        router.push('/games/gamehub');
      } else {
        setIsRedirecting(false);
      }
    } catch (error) {
      setAuthError(error.message);
      setIsRedirecting(false);
    }
  };

  const handleEmailLogin = async ({ email, password }) => {
    setAuthError('');
    try {
      const result = await login(email, password);
      if (result) {
        router.push('/games/gamehub');
      }
      return result;
    } catch (error) {
      setAuthError(error.message || 'Login failed');
      return null;
    }
  };

  if (loading || isRedirecting || user) {
    return (
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          mt: 8,
          display: 'flex',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--background)',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

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
                onClick={() => router.push('/games/gamehub')}
                sx={{
                  textTransform: 'none',
                  color: 'var(--foreground)',
                }}
              >
                Back to Games
              </Button>
            </Box>

            {/* Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <LoginIcon sx={{ fontSize: 48, color: 'var(--accent)', mr: 2 }} />
              <Typography
                component="h1"
                variant="h4"
                sx={{ fontWeight: 'bold', color: 'var(--accent)' }}
              >
                SIGN IN
              </Typography>
            </Box>

            {/* Signup prompt */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: 'var(--foreground)' }}>
                New user?{' '}
                <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 'bold',
                      color: 'var(--accent)',
                      textDecoration: 'underline',
                    }}
                  >
                    CREATE ACCOUNT
                  </Typography>
                </Link>
              </Typography>
            </Box>

            {(authError || error) && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {authError || error}
              </Alert>
            )}

            {!showEmailForm ? (
              <Box sx={{ width: '100%' }}>
                {/* Google Sign In */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleGoogleLogIn}
                  startIcon={<GoogleIcon sx={{ fontSize: 30 }} />}
                  sx={{
                    mb: 2,
                    py: 2,
                    backgroundColor: '#4285F4',
                    '&:hover': { backgroundColor: '#357ae8' },
                    textTransform: 'none',
                    fontSize: '1.1rem',
                  }}
                >
                  Continue with Google
                </Button>

                {/* Apple Sign In */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleAppleLogIn}
                  startIcon={<AppleIcon sx={{ fontSize: 30 }} />}
                  sx={{
                    mb: 2,
                    py: 2,
                    backgroundColor: '#000000',
                    '&:hover': { backgroundColor: '#333333' },
                    textTransform: 'none',
                    fontSize: '1.1rem',
                  }}
                >
                  Continue with Apple
                </Button>

                <Divider sx={{ my: 3, color: 'var(--foreground)' }}>OR</Divider>

                {/* Email Sign In */}
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => setShowEmailForm(true)}
                  startIcon={<EmailIcon sx={{ fontSize: 30 }} />}
                  sx={{
                    py: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    borderWidth: 2,
                    borderColor: 'var(--accent)',
                    color: 'var(--foreground)',
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: 'var(--input-bg)',
                    },
                  }}
                >
                  Continue with Email
                </Button>
              </Box>
            ) : (
              <Box sx={{ width: '100%' }}>
                <Button
                  variant="text"
                  onClick={() => setShowEmailForm(false)}
                  sx={{ mb: 2, color: 'var(--foreground)' }}
                >
                  &larr; Back to options
                </Button>
                <EmailAuthForm mode="login" onSubmit={handleEmailLogin} error={authError || error} />
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Link href="/auth/reset-password" style={{ textDecoration: 'none' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'var(--accent)',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Forgot Password?
                    </Typography>
                  </Link>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
