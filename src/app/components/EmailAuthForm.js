// components/EmailAuthForm.js
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import PropTypes from 'prop-types';

const EmailAuthForm = ({ mode, onSubmit, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isSignUp = mode === 'signup';
  const buttonText = isSignUp ? 'Sign Up' : 'Log In';

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    // At least 8 characters, at least one letter and one number
    const re = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    return re.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Email and password are required');
      return;
    }

    if (!validateEmail(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (isSignUp) {
      if (!firstName || !lastName) {
        setFormError('First name and last name are required');
        return;
      }

      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }

      if (!validatePassword(password)) {
        setFormError('Password must be at least 8 characters with at least one letter and one number');
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit({
        email,
        password,
        firstName,
        lastName
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setFormError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: 'var(--input-bg)',
        border: '1px solid var(--border-color)',
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'var(--foreground)' }}>
        {isSignUp ? 'Create an Account' : 'Login with Email'}
      </Typography>

      {(error || formError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {error || formError}
          </Typography>
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {isSignUp && (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              label="First Name"
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              sx={{ backgroundColor: 'var(--background)' }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Last Name"
              name="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              sx={{ backgroundColor: 'var(--background)' }}
            />
          </>
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
          sx={{ backgroundColor: 'var(--background)' }}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ backgroundColor: 'var(--background)' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {isSignUp && (
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ backgroundColor: 'var(--background)' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            backgroundColor: 'var(--accent)',
            '&:hover': { opacity: 0.9 },
          }}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? `${isSignUp ? 'Signing Up' : 'Logging In'}...` : buttonText}
        </Button>
      </Box>
    </Paper>
  );
};

EmailAuthForm.propTypes = {
  mode: PropTypes.oneOf(['login', 'signup']).isRequired,
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default EmailAuthForm;
