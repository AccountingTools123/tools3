import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

function StripeInfo({ onSubscriptionUpdate }) {
  const [stripeToken, setStripeToken] = useState('');

  const handleSubmit = () => {
    // Simulate successful Stripe payment processing and update the subscription
    if (stripeToken) {
      onSubscriptionUpdate();
    }
  };

  return (
    <Box textAlign="center" my={2}>
      <Typography variant="h6">Enter your Stripe Information</Typography>
      <Box my={2}>
        <TextField
          label="Stripe Token"
          variant="outlined"
          value={stripeToken}
          onChange={(e) => setStripeToken(e.target.value)}
        />
      </Box>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
}

export default StripeInfo;
