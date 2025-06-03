import { app } from './firebaseConfig';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc 
 } from 'firebase/firestore';
import { Usuario } from '../context/UsuarioContext';

const auth = getAuth(app);
const db = getFirestore(app);

export const iniciarSesion = async (email: string, password: string): Promise<Usuario> => {
  // Autenticar con Firebase Auth
  const credenciales = await signInWithEmailAndPassword(auth, email, password);

  // Normalizar email para búsqueda en Firestore
  const emailLimpio = email.trim().toLowerCase();

  // Obtener colección usuarios
  const usuariosRef = collection(db, 'usuarios');
  const snapshot = await getDocs(usuariosRef);

  // Buscar documento que coincida con email normalizado
  const docUsuario = snapshot.docs.find(
    doc => doc.data().email.trim().toLowerCase() === emailLimpio
  );

  if (!docUsuario) {
  // Crear usuario básico en Firestore si no existe
  const nuevoUsuario: Omit<Usuario, 'id'> = {
    email: emailLimpio,
    nombre: 'Nuevo usuario',
    apellidos: '',
    empresaId: '',
    rol: 'profesional', 
  };

  const docRef = await addDoc(collection(db, 'usuarios'), nuevoUsuario);
  return { id: docRef.id, ...nuevoUsuario };
}


  // Construir objeto Usuario completo
  const usuario: Usuario = {
    id: docUsuario.id,
    ...(docUsuario.data() as Omit<Usuario, 'id'>),
  };

  return usuario;
};


export const cerrarSesion = async () => {
  return await signOut(auth);
};

export const registrarUsuario = async (email: string, clave: string) => {
  return await createUserWithEmailAndPassword(auth, email, clave);
};

export const comprobarUsuarioExistente = async (email: string) => {
  const methods = await fetchSignInMethodsForEmail(auth, email);
  return methods.length > 0;
};

export const recuperarContraseña = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return 'Se ha enviado un correo para recuperar la contraseña.';
  } catch (error: any) {
    throw new Error(error.message);
  }
};

