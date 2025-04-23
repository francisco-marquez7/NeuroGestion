// firebase/auth.ts
import { app } from './firebaseConfig';
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail } from 'firebase/auth';

// Instancia de auth
const auth = getAuth(app);

// Función: Login de usuario
export const iniciarSesion = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Función: Cerrar sesión
export const cerrarSesion = async () => {
  return await signOut(auth);
};

// Función para registrar usuario
export const registrarUsuario = async (email: string, clave: string) => {
  const auth = getAuth();
  const usuario = await createUserWithEmailAndPassword(auth, email, clave);
  return usuario;
};

// Función para comprobar si el usuario ya existe
export const comprobarUsuarioExistente = async (email: string) => {
  const auth = getAuth();
  const methods = await fetchSignInMethodsForEmail(auth, email);
  return methods.length > 0; // Si existe un método de inicio de sesión asociado al correo, el usuario ya está registrado.
};

// Función para recuperar la contraseña (enviar un correo con un enlace de recuperación)
export const recuperarContraseña = async (email: string) => {
  const auth = getAuth();
  try {
    // Enviar un correo de recuperación de contraseña a la dirección proporcionada
    await sendPasswordResetEmail(auth, email);
    return 'Se ha enviado un correo para recuperar la contraseña.';
  } catch (error: any) {
    throw new Error(error.message); // Lanza un error si ocurre algún problema
  }
};