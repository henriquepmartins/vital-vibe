// replace the entire `ws` package with the global WebSocket
const WebSocketImpl = global.WebSocket;
export default WebSocketImpl;
export const WebSocket = WebSocketImpl;
