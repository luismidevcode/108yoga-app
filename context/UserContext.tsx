import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  UniqueId: string | number;
  id: string;
  FirstName: string;
  LastName: string;
  email: string;
  CreationDate: string;
  BirthDate: string | null;
  Gender: string;
  MobilePhone: string | null;
  Status: string;
  Country: string;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  saveUser: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const UserProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    AsyncStorage.getItem('user').then(storedUser => {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    });
  }, []);

  // Recibe el objeto Client de la API y lo mapea al modelo User
  const saveUser = async (clientData: any) => {
    const userData: User = {
      UniqueId: clientData.UniqueId,
      id: clientData.Id?.toString() ?? '',
      FirstName: clientData.FirstName ?? '',
      LastName: clientData.LastName ?? '',
      email: clientData.Email ?? '',
      CreationDate: clientData.CreationDate ?? '',
      BirthDate: clientData.BirthDate ?? null,
      Gender: clientData.Gender ?? '',
      MobilePhone: clientData.MobilePhone ?? null,
      Status: clientData.Status ?? '',
      Country: clientData.Country ?? '',
    };
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, saveUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de UserProvider');
  }
  return context;
};

