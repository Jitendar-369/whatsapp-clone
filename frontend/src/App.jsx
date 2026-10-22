import Login from './components/Login';
import Chat from './components/Chat';
import { useAuthStore } from './store/authStore';

function App() {
  const user = useAuthStore((state) => state.user);

  // key remounts Chat (and its WebSocket) when a different user signs in
  return user ? <Chat key={user.id} /> : <Login />;
}

export default App;
