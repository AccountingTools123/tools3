const express = require('express');
const bodyParser = require('body-parser');
const { sendCommentEmail } = require('./emailService');

const app = express();
const port = 4000;

// Middleware
app.use(bodyParser.json());

// Route to handle sending comment
app.post('/send-comment', async (req, res) => {
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).send('Comment is required');
  }

  try {
    await sendCommentEmail(comment);
    res.status(200).send('Comment sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send comment');
  }
});
const cors = require('cors');
app.use(cors());



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
