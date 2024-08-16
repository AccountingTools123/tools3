// Comments.js
import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

function Comments() {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = () => {
    if (comment.trim()) {
      setComments([...comments, comment]);
      setComment('');
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h6">Comments</Typography>
      <TextField
        label="Enter your comment"
        multiline
        rows={4}
        value={comment}
        onChange={handleCommentChange}
        fullWidth
      />
      <Button onClick={handleSubmit} variant="contained" color="primary" style={{ marginTop: '1rem' }}>
        Submit
      </Button>
      <Box mt={2}>
        {comments.map((comment, index) => (
          <Box key={index} mb={1} p={2} border={1} borderColor="grey.400" borderRadius={1}>
            {comment}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default Comments;
