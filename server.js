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
      const newMsg = { id: Date.now(), user: msg.user, text: msg.text };
      messages.push(newMsg);

      // broadcast ke semua client
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "chat", message: newMsg }));
        }
      });
    }

    if (msg.type === "delete") {
      messages = messages.filter((m) => m.id !== msg.id);

      // broadcast pesan terhapus
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "delete", id: msg.id }));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running on ws://localhost:8080");
