import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from './slices/authSlice';
import { setUser, clearUser } from './slices/userSlice';

// Custom hook for accessing auth state
export const useAuth = () => useSelector((state) => state.auth);

// Custom hook for dispatching auth actions
export const useAuthActions = () => {
  const dispatch = useDispatch();
  return {
    loginSuccess: (token) => dispatch(loginSuccess(token)),
    logout: () => dispatch(logout()),
  };
};

// Custom hook for accessing user state
export const useUser = () => useSelector((state) => state.user);

// Custom hook for dispatching user actions
export const useUserActions = () => {
  const dispatch = useDispatch();
  return {
    setUser: (userInfo) => dispatch(setUser(userInfo)),
    clearUser: () => dispatch(clearUser()),
  };
};