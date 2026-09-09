import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserKey = 'surya' | 'sadhana';

export interface UserProfile {
  id: UserKey;
  name: string;
  partnerName: string;
  partnerKey: UserKey;
  emoji: string;
  partnerEmoji: string;
  theme: 'th-g' | 'th-p';
  accentColor: string;
  accentGlow: string;
  greeting: string;
  avatarLetter: string;
}

export const USERS: Record<UserKey, UserProfile> = {
  surya: {
    id: 'surya',
    name: 'Surya',
    partnerName: 'Sadhana',
    partnerKey: 'sadhana',
    emoji: '🌿',
    partnerEmoji: '❤️',
    theme: 'th-g',
    accentColor: '#10b981',
    accentGlow: 'rgba(16,185,129,0.25)',
    greeting: 'Welcome back, Surya 🌿',
    avatarLetter: 'S'
  },
  sadhana: {
    id: 'sadhana',
    name: 'Sadhana',
    partnerName: 'Surya',
    partnerKey: 'surya',
    emoji: '❤️',
    partnerEmoji: '🌿',
    theme: 'th-p',
    accentColor: '#f43f5e',
    accentGlow: 'rgba(244,63,94,0.25)',
    greeting: 'Welcome back, Sadhana ❤️',
    avatarLetter: 'S'
  }
};

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  disguiseMode: boolean; // Panic camouflage mode
  secretMode: boolean;
  toggleDisguise: () => void;
  login: (usernameInput: string, passwordInput: string) => boolean;
  directLogin: (userKey: UserKey) => void;
  logout: () => void;
  unlockSecretMode: (pin: string) => boolean;
  lockSecretMode: () => void;
  detectUser: (username: string, password: string) => UserKey | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'studyportal_auth_user_v1';
const SECRET_STORAGE_KEY = 'studyportal_secret_unlocked_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved === 'surya' || saved === 'sadhana') {
        return USERS[saved];
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [disguiseMode, setDisguiseMode] = useState(false);
  const [secretMode, setSecretMode] = useState(() => {
    try {
      return sessionStorage.getItem(SECRET_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (currentUser) {
      document.body.className = currentUser.theme;
    } else {
      document.body.className = '';
    }
  }, [currentUser]);

  const detectUser = (username: string, password: string): UserKey | null => {
    const u = username.trim().toLowerCase();
    const p = password.trim();

    if (u === 'sadhana' || p === '29/02/2008' || (u === 'dharya' && p.startsWith('29'))) {
      return 'sadhana';
    }
    if (u === 'surya' || p === '09/10/2007' || (u === 'dharya' && p.startsWith('09'))) {
      return 'surya';
    }
    return null;
  };

  const login = (usernameInput: string, passwordInput: string): boolean => {
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    // Check Surya
    if ((u === 'surya' || u === 'dharya') && (p === '09/10/2007' || p === '09102007' || p === 'surya')) {
      setCurrentUser(USERS.surya);
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'surya');
      localStorage.setItem(AUTH_STORAGE_KEY, 'surya');
      return true;
    }

    // Check Sadhana
    if ((u === 'sadhana' || u === 'dharya') && (p === '29/02/2008' || p === '29022008' || p === 'sadhana')) {
      setCurrentUser(USERS.sadhana);
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'sadhana');
      localStorage.setItem(AUTH_STORAGE_KEY, 'sadhana');
      return true;
    }

    return false;
  };

  const directLogin = (userKey: UserKey) => {
    const user = USERS[userKey];
    if (user) {
      setCurrentUser(user);
      sessionStorage.setItem(AUTH_STORAGE_KEY, userKey);
      localStorage.setItem(AUTH_STORAGE_KEY, userKey);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setSecretMode(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(SECRET_STORAGE_KEY);
  };

  const toggleDisguise = () => {
    setDisguiseMode((prev) => !prev);
  };

  const unlockSecretMode = (pin: string): boolean => {
    const cleanPin = pin.trim();
    if (cleanPin === '0929' || cleanPin === '2909' || cleanPin === '0910' || cleanPin === '2902') {
      setSecretMode(true);
      sessionStorage.setItem(SECRET_STORAGE_KEY, 'true');
      return true;
    }
    return false;
  };

  const lockSecretMode = () => {
    setSecretMode(false);
    sessionStorage.removeItem(SECRET_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        disguiseMode,
        secretMode,
        toggleDisguise,
        login,
        directLogin,
        logout,
        unlockSecretMode,
        lockSecretMode,
        detectUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
