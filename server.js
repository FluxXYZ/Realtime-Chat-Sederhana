// Install: npm install ws
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

let messages = []; // simpan pesan di memory

server.on("connection", (ws) => {
  console.log("Client connected");

  // kirim semua pesan lama ke client baru
  ws.send(JSON.stringify({ type: "init", messages }));

  ws.on("message", (data) => {
    const msg = JSON.parse(data);

    if (msg.type === "chat") {
      const newMsg = { 
        id: Date.now(), 
        username: msg.username || 'Anonymous', 
        text: msg.text,
        timestamp: new Date().toISOString()
      };
      messages.push(newMsg);

      console.log(`Message from ${newMsg.username}: ${newMsg.text}`);

      // broadcast ke semua client
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "chat", message: newMsg }));
        }
      });
    }

    if (msg.type === "delete") {
      const messageIndex = messages.findIndex(m => m.id === msg.id);
      if (messageIndex !== -1) {
        const deletedMessage = messages[messageIndex];
        messages = messages.filter((m) => m.id !== msg.id);
        
        console.log(`Message deleted by ${deletedMessage.username}: ${deletedMessage.text}`);

        // broadcast pesan terhapus
        server.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "delete", id: msg.id }));
          }
        });
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

server.on("error", (error) => {
  console.error("Server error:", error);
});

console.log("WebSocket server running on ws://localhost:8080");

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});