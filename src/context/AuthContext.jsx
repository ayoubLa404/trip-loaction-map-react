import { useReducer } from 'react';
import { createContext, useContext } from 'react';

const AuthContext = createContext();

const FAKE_USER = {
  name: 'Ahmed',
  email: 'Ahmed@example.com',
  password: '12345',
  avatar: 'https://i.pravatar.cc/100?u=eh',
};

const initialState = { user: null, isAuthenticated: false };
function reducer(state, action) {
  switch (action.type) {
    case 'login':
      return { ...state, isAuthenticated: true, user: action.payload };

    case 'logout':
      return { ...initialState };

    default:
      throw new Error('Unkown action');
  }
}

function AuthProvider({ children }) {
  const [{ user, isAuthenticated }, dispatch] = useReducer(reducer, initialState);

  function login(email, password) {
    if (email === FAKE_USER.email && password === FAKE_USER.password)
      dispatch({ type: 'login', payload: FAKE_USER });
  }

  function logout() {
    dispatch({ type: 'logout' });
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('you used useAuth outside Provider');
  return context;
}

export { AuthProvider, useAuth };
