const AUTH_KEY = 'isAuthenticated';
const PASSWORD_KEY = 'appPassword';
const DEFAULT_PASSWORD = '123';
export const login = (password: string): boolean => {
  const storedPassword = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
  if (password === storedPassword) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_KEY) === 'true';
};
