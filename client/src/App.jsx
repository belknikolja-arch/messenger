import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from './socket';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';

export default function App() {
  const [connected, setConnected] = useState(socket.connected);
  const [me, setMe] = useState(null);                 // мой профиль
  const [rooms, setRooms] = useState([]);             // список каналов
  const [activeRoom, setActiveRoom] = useState(null); // текущий канал
  const [messages, setMessages] = useState([]);       // сообщения текущего канала
  const [users, setUsers] = useState([]);             // кто онлайн в канале
  const [typingNames, setTypingNames] = useState([]); // кто печатает
  const [unread, setUnread] = useState({});           // непрочитанные по каналам
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nameRef = useRef(null);         // для авто-повторного входа при реконнекте
  const activeRoomRef = useRef(null);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      // переподключение после обрыва — заходим снова под прежним именем
      if (nameRef.current) socket.emit('user:join', { name: nameRef.current });
    };
    const onDisconnect = () => setConnected(false);

    const onUserInit = (payload) => {
      activeRoomRef.current = payload.activeRoom;
      setMe(payload.user);
      setRooms(payload.rooms);
      setActiveRoom(payload.activeRoom);
      setUsers(payload.users);
      setMessages(payload.history);
    };

    const onRoomJoined = ({ roomId, users, history }) => {
      activeRoomRef.current = roomId;
      setActiveRoom(roomId);
      setUsers(users);
      setMessages(history);
      setTypingNames([]);
      setUnread((u) => ({ ...u, [roomId]: 0 }));
    };

    const onRoomsUpdate = (list) => setRooms(list);
    const onUsersUpdate = (list) => setUsers(list);

    const onTyping = ({ roomId, name, isTyping }) => {
      if (roomId !== activeRoomRef.current) return;
      setTypingNames((prev) =>
        isTyping
          ? prev.includes(name) ? prev : [...prev, name]
          : prev.filter((n) => n !== name),
      );
    };

    const onMessage = (message) => {
      if (message.roomId === activeRoomRef.current) {
        setMessages((prev) => [...prev, message]);
      } else {
        setUnread((u) => ({ ...u, [message.roomId]: (u[message.roomId] ?? 0) + 1 }));
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('user:init', onUserInit);
    socket.on('room:joined', onRoomJoined);
    socket.on('rooms:update', onRoomsUpdate);
    socket.on('users:update', onUsersUpdate);
    socket.on('typing:update', onTyping);
    socket.on('message:new', onMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('user:init', onUserInit);
      socket.off('room:joined', onRoomJoined);
      socket.off('rooms:update', onRoomsUpdate);
      socket.off('users:update', onUsersUpdate);
      socket.off('typing:update', onTyping);
      socket.off('message:new', onMessage);
    };
  }, []);

  const handleJoin = useCallback((name) => {
    nameRef.current = name;
    socket.emit('user:join', { name });
  }, []);

  const handleJoinRoom = useCallback((roomId) => {
    socket.emit('room:join', { roomId });
  }, []);

  const handleCreateRoom = useCallback((label) => {
    socket.emit('room:create', { name: label });
  }, []);

  const handleSend = useCallback((text) => {
    socket.emit('message:send', { text });
  }, []);

  const handleTyping = useCallback((isTyping) => {
    socket.emit(isTyping ? 'typing:start' : 'typing:stop');
  }, []);

  if (!me) {
    return <Login onJoin={handleJoin} connected={connected} />;
  }

  const room = rooms.find((r) => r.id === activeRoom);

  return (
    <div className="app">
      {!connected && (
        <div className="app__offline">⚠ Соединение потеряно, переподключаемся…</div>
      )}

      <Sidebar
        open={sidebarOpen}
        me={me}
        rooms={rooms}
        activeRoom={activeRoom}
        users={users}
        unread={unread}
        onJoinRoom={handleJoinRoom}
        onCreateRoom={handleCreateRoom}
        onNavigate={() => setSidebarOpen(false)}
      />

      {room ? (
        <Chat
          me={me}
          room={room}
          onlineCount={users.length}
          messages={messages}
          typingNames={typingNames}
          onSend={handleSend}
          onTyping={handleTyping}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      ) : (
        <main className="chat chat--empty">Выберите канал</main>
      )}
    </div>
  );
}
