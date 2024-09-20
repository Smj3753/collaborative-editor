// server/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/collab-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Document schema
const docSchema = new mongoose.Schema({
  content: String,
});
const Document = mongoose.model('Document', docSchema);

// API endpoint to get document
app.get('/document/:id', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  res.json(doc);
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('editDocument', async (data) => {
    // Broadcast the edit to all clients
    socket.broadcast.emit('documentEdited', data);
    // Save to MongoDB if needed
    await Document.findByIdAndUpdate(data.id, { content: data.content });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
