let ioInstance = null;

export function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    socket.on("poll:join", (pollId) => {
      if (!pollId) {
        return;
      }

      socket.join(`poll:${pollId}`);
    });

    socket.on("disconnect", () => {});
  });
}

export function getIO() {
  return ioInstance;
}