import { create } from 'zustand';

const useUserStore = create((set) => {
  // 从localStorage初始化
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isAuthenticated: !!storedToken,

    setUser: (user) => {
      set({ user, isAuthenticated: !!user });
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    },
    setToken: (token) => {
      set({ token, isAuthenticated: !!token });
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },
    logout: () => {
      set({ user: null, token: null, isAuthenticated: false });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  };
});

export default useUserStore;
