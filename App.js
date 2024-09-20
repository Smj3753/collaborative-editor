// client/src/App.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Editor, EditorState } from 'draft-js';

const socket = io('http://localhost:5000');

function App() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [docId] = useState('YOUR_DOCUMENT_ID'); // Replace with your document ID

  useEffect(() => {
    // Fetch initial document content
    fetch(`http://localhost:5000/document/${docId}`)
      .then(response => response.json())
      .then(data => {
        setEditorState(EditorState.createWithContent(data.content));
      });

    // Listen for document edits
    socket.on('documentEdited', (data) => {
      setEditorState(EditorState.createWithContent(data.content));
    });

    return () => {
      socket.off('documentEdited');
    };
  }, [docId]);

  const onEditorStateChange = (state) => {
    setEditorState(state);
    // Emit the edit to other clients
    const content = state.getCurrentContent().getPlainText();
    socket.emit('editDocument', { id: docId, content });
  };

  return (
    <div>
      <h1>Collaborative Editor</h1>
      <Editor editorState={editorState} onEditorStateChange={onEditorStateChange} />
    </div>
  );
}


export default App;
