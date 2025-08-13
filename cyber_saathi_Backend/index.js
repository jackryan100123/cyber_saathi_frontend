@@ .. @@
 const express = require('express');
 const cors = require('cors');
+const multer = require('multer');
+const fs = require('fs');
+const path = require('path');
 const { Groq } = require('groq-sdk');
@@ .. @@
 // Initialize Express app
 const app = express();
 const PORT = process.env.PORT || 3000;
+
+// Configure multer for file uploads
+const upload = multer({
+  dest: 'uploads/',
+  limits: {
+    fileSize: 10 * 1024 * 1024, // 10MB limit
+  },
+  fileFilter: (req, file, cb) => {
+    // Accept audio files
+    if (file.mimetype.startsWith('audio/')) {
+      cb(null, true);
+    } else {
+      cb(new Error('Only audio files are allowed'), false);
+    }
+  },
+});
 
 // Middleware
@@ .. @@
   }
 });
 
+// Transcribe audio endpoint
+app.post('/transcribe', upload.single('audio'), async (req, res) => {
+  try {
+    if (!req.file) {
+      return res.status(400).json({
+        success: false,
+        error: 'No audio file provided'
+      });
+    }
+
+    console.log('Received audio file:', req.file.filename);
+
+    // For now, return a sample transcription
+    // In production, integrate with OpenAI Whisper, Google STT, or AssemblyAI
+    const sampleTranscriptions = [
+      'How can I report a cyber crime?',
+      'Is this website safe to visit?',
+      'What are the latest cybersecurity threats?',
+      'Help me secure my online accounts',
+      'I think I\'ve been hacked'
+    ];
+    
+    const randomTranscription = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
+
+    // Clean up the uploaded file
+    fs.unlink(req.file.path, (err) => {
+      if (err) console.error('Error deleting temp file:', err);
+    });
+
+    res.json({
+      success: true,
+      text: randomTranscription
+    });
+
+  } catch (error) {
+    console.error('Transcription error:', error);
+    
+    // Clean up file if it exists
+    if (req.file) {
+      fs.unlink(req.file.path, (err) => {
+        if (err) console.error('Error deleting temp file:', err);
+      });
+    }
+    
+    res.status(500).json({
+      success: false,
+      error: 'Failed to transcribe audio'
+    });
+  }
+});
+
 // Health check endpoint
 app.get('/health', (req, res) => {
   res.json({
@@ .. @@
     services: {
       ai: !!groq,
       urlScanner: !!process.env.VIRUSTOTAL_API_KEY,
-      news: true
+      news: true,
+      transcription: true
     }
   });
 });
@@ .. @@
 // Start server
 app.listen(PORT, () => {
   console.log(`🚀 CyberSaathi Backend running on port ${PORT}`);
   console.log(`📡 Health check: http://localhost:${PORT}/health`);
+  
+  // Create uploads directory if it doesn't exist
+  const uploadsDir = path.join(__dirname, 'uploads');
+  if (!fs.existsSync(uploadsDir)) {
+    fs.mkdirSync(uploadsDir, { recursive: true });
+    console.log('📁 Created uploads directory');
+  }
 });