import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

const Login = ({ onLogin, toggleSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event) => {
    event.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem('isLoggedIn', 'true');
      onLogin(true);
    } else {
      alert('Invalid username or password');
    }
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
      <Box component="form" onSubmit={handleLogin} sx={{ width: 300 }}>
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
          Login
        </Button>
      </Box>
      <Button color="secondary" onClick={toggleSignup} sx={{ marginTop: 2 }}>
        Sign Up
      </Button>
    </Box>
  );
};

export default Login;
