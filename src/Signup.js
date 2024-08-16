import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

const Signup = ({ onSignup, toggleLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = event => {
    event.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(user => user.username === username);

    if (existingUser) {
      alert('Username already exists');
      return;
    }

    const signupDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(signupDate.getDate() + 7);

    users.push({
      username,
      password,
      signupDate: signupDate.toISOString(),
      trialEndDate: trialEndDate.toISOString(),
    });

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('trialEndDate', trialEndDate.toISOString());
    onSignup();
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{ backgroundColor: 'background.default' }}
    >
      <Box component="form" onSubmit={handleSignup} sx={{ width: 300 }}>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ padding: '10px', marginTop: 2 }}
        >
          Sign Up
        </Button>
      </Box>
      <Button color="secondary" onClick={toggleLogin} sx={{ marginTop: 2 }}>
        Login
      </Button>
    </Box>
  );
};

export default Signup;
