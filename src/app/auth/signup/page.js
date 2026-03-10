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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AppleIcon from '@/components/AppleIcon';
import EmailAuthForm from '@/components/EmailAuthForm';
import Link from 'next/link';

const SignupPage = () => {
  const router = useRouter();
  const { user, loading, error, authenticateWithGoogle, authenticateWithApple, signUp } = useContext(AuthContext);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/games/gamehub');
    }
  }, [user, loading, router]);

  const handleGoogleSignUp = async () => {
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

  const handleAppleSignUp = async () => {
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

  const handleEmailSignUp = async ({ email, password, firstName, lastName }) => {
    setAuthError('');
    try {
      const result = await signUp({ email, password, firstName, lastName });
      if (result) {
        router.push('/games/gamehub');
      }
      return result;
    } catch (error) {
      setAuthError(error.message || 'Sign up failed');
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
              <PersonAddIcon sx={{ fontSize: 48, color: 'var(--accent)', mr: 2 }} />
              <Typography
                component="h1"
                variant="h4"
                sx={{ fontWeight: 'bold', color: 'var(--accent)' }}
              >
                SIGN UP
              </Typography>
            </Box>

            {/* Login prompt */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: 'var(--foreground)' }}>
                Already have an account?{' '}
                <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 'bold',
                      color: 'var(--accent)',
                      textDecoration: 'underline',
                    }}
                  >
                    SIGN IN
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
                {/* Google Sign Up */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleGoogleSignUp}
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

                {/* Apple Sign Up */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleAppleSignUp}
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

                {/* Email Sign Up */}
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
                  Sign up with Email
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
                <EmailAuthForm mode="signup" onSubmit={handleEmailSignUp} error={authError || error} />
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupPage;
