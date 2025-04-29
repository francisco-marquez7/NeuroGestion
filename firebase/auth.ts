import { app } from './firebaseConfig';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const auth = getAuth(app);
const db = getFirestore(app);

export const iniciarSesion = async (email: string, password: string) => {
  const credenciales = await signInWithEmailAndPassword(auth, email, password);
  const usuariosRef = collection(db, 'usuarios');
  const snapshot = await getDocs(usuariosRef);
  const docUsuario = snapshot.docs.find(doc => doc.data().email === email);

  if (!docUsuario) {
    throw new Error('Usuario no encontrado en Firestore');
  }

  return {
    id: docUsuario.id,
    ...docUsuario.data(),
  };
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
