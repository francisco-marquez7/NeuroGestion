import React, { createContext, useContext, useState, ReactNode } from 'react';
import { iniciarSesion } from '../firebase/auth'; // Ajusta la ruta si es necesario

export interface Usuario {
  id: string;              
  email: string;
  nombre: string;
  apellidos: string;
  empresaId: string;
  rol: string;
}

interface UsuarioContextProps {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
  login: (email: string, password: string) => Promise<void>;
}

const UsuarioContext = createContext<UsuarioContextProps | undefined>(undefined);

export const UsuarioProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Función para hacer login y actualizar el estado usuario
  const login = async (email: string, password: string) => {
    try {
      const usuarioLogueado = await iniciarSesion(email, password);
      setUsuario(usuarioLogueado);
    } catch (error) {
      throw error; // Puedes manejar el error donde llames login
    }
  };

  return (
    <UsuarioContext.Provider value={{ usuario, setUsuario, login }}>
      {children}
    </UsuarioContext.Provider>
  );
};

export const useUsuario = () => {
  const context = useContext(UsuarioContext);
  if (!context) {
    throw new Error('useUsuario debe usarse dentro de un UsuarioProvider');
  }
  return context;
};
