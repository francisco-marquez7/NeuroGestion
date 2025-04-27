import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Usuario {
  id: string;              // ID del documento en Firestore
  email: string;
  nombre: string;
  apellidos?: string;
  empresaId: string;
  rol: string;
}

interface UsuarioContextProps {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
}

const UsuarioContext = createContext<UsuarioContextProps | undefined>(undefined);

export const UsuarioProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  return (
    <UsuarioContext.Provider value={{ usuario, setUsuario }}>
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
