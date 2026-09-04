const { Server } = require('socket.io');

/**
 * Shared Socket.io instance (Phase 7).
 *
 * server.js calls initSocket(server) once at boot; controllers import getIO()
 * and emit domain events after mutations. The io reference is also exposed on
 * the Express app as `app.set('io', io)` for any non-controller callers.
 */
let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: true, credentials: true },
  });

  io.on('connection', (socket) => {
    // Client connects with `auth: { token }` — accept and log quietly; the
    // HTTP layer enforces auth on the mutations that drive these events.
    socket.on('error', () => {
      // Client-side socket errors are non-fatal for the server.
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = { initSocket, getIO };