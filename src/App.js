import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Container, Box, Button, Tabs, Tab } from '@mui/material';
import AccountsReceivable from './AccountsReceivable';
import AccountsPayable from './AccountsPayable';
import StripeInfo from './StripeInfo';
import Login from './Login';
import Signup from './Signup';
import Comments from './Comments';

function App() {
  const [activeTab, setActiveTab] = useState('accountsReceivable');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  const theme = createTheme({
    palette: {
      primary: { main: '#4CAF50' },
      background: { default: '#f4f4f9' },
    },
    typography: { fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
  });

  const initializeTrialPeriod = () => {
    const trialStartDate = new Date();
    const initialTrialEndDate = new Date(trialStartDate);
    initialTrialEndDate.setDate(trialStartDate.getDate() + 7); // Set trial period to 7 days
    setTrialEndDate(initialTrialEndDate);
    localStorage.setItem('trialEndDate', initialTrialEndDate.toISOString());
  };
  

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    const trialEndDateStr = localStorage.getItem('trialEndDate');
  
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
    }
  
    if (trialEndDateStr) {
      setTrialEndDate(new Date(trialEndDateStr));
    } else {
      initializeTrialPeriod(); // Initialize for new accounts
    }
  
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const adminExists = users.find(user => user.username === 'admin');
  
    if (!adminExists) {
      users.push({
        username: 'admin',
        password: 'admin',
        signupDate: '1970-01-01T00:00:00.000Z',
        trialEndDate: '9999-12-31T23:59:59.999Z',
      });
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, []);
  

  useEffect(() => {
    if (trialEndDate) {
      const interval = setInterval(() => {
        const now = new Date();
        const timeDifference = trialEndDate - now;

        if (timeDifference <= 0) {
          setTimeLeft('Trial period expired');
          clearInterval(interval);
        } else {
          const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [trialEndDate]);

  const handleLogin = status => setIsLoggedIn(status);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  const toggleSignup = () => setIsSignup(!isSignup);

  const handleSubscriptionUpdate = () => {
    if (trialEndDate) {
      const newTrialEndDate = new Date(trialEndDate);
      newTrialEndDate.setDate(newTrialEndDate.getDate() + 30); // Add 30 days
      setTrialEndDate(newTrialEndDate);
      localStorage.setItem('trialEndDate', newTrialEndDate.toISOString());
    }
  };
  

  if (!isLoggedIn) {
    return isSignup ? <Signup onSignup={toggleSignup} toggleLogin={toggleSignup} /> : <Login onLogin={handleLogin} toggleSignup={toggleSignup} />;
  }

  const currentDate = new Date();
  const isTrialExpired = trialEndDate && currentDate > trialEndDate;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">Accounting Tools 123</Typography>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </Toolbar>
        </AppBar>
        <Box my={2} textAlign="center">
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered indicatorColor="primary" textColor="primary">
            <Tab label="Accounts Receivable" value="accountsReceivable" />
            <Tab label="Accounts Payable" value="accountsPayable" />
            <Tab label="Stripe Information" value="stripeInfo" />
            <Tab label="Comments" value="comments" />
          </Tabs>
        </Box>
        <Box>
          {activeTab === 'accountsReceivable' && <AccountsReceivable />}
          {activeTab === 'accountsPayable' && <AccountsPayable />}
          {activeTab === 'stripeInfo' && <StripeInfo onSubscriptionUpdate={handleSubscriptionUpdate} />}
          {activeTab === 'comments' && <Comments />}
        </Box>
        {trialEndDate && (
          <Box my={2} textAlign="center">
            <Typography variant="h6">
              {isTrialExpired ? 'Trial period expired' : `Time left in trial: ${timeLeft}`}
            </Typography>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
