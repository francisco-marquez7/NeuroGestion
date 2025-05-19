import { getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, getDoc, query, where, doc } from 'firebase/firestore';
import { app, storage } from './firebaseConfig';

export const db = getFirestore(app);
export { storage };

export const agregarUsuario = async (usuario: any) => {
  try {
    await addDoc(collection(db, 'usuarios'), usuario);
    console.log('Usuario agregado a Firestore correctamente');
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    throw error;
  }
};

export const obtenerPacientes = async () => {
  try {
    const pacientesRef = collection(db, 'pacientes');
    const snapshot = await getDocs(pacientesRef);

    const pacientes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return pacientes;
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    return [];
  }
};

export const agregarPaciente = async (paciente: any) => {
  try {
    await addDoc(collection(db, 'pacientes'), paciente);
  } catch (error) {
    console.error('Error al agregar paciente:', error);
  }
};
export const eliminarPaciente = async (id: string) => {
  try {
    const pacienteRef = doc(db, 'pacientes', id);
    await deleteDoc(pacienteRef);
    console.log('Paciente eliminado con éxito');
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    throw error;
  }
};
export const actualizarPaciente = async (id: string, datosActualizados: any) => {
  try {
    const ref = doc(db, 'pacientes', id);
    await updateDoc(ref, datosActualizados);
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    throw error;
  }
};

export const buscarUsuarioPorEmail = async (email: string) => {
  try {
    const usuariosRef = collection(db, 'usuarios');
    const snapshot = await getDocs(usuariosRef);

    const usuarios = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any), 
    }));

    return usuarios.find((u) => u.email === email) || null;
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    return null;
  }
};

export const obtenerNombreEmpresaPorId = async (empresaId: string): Promise<string> => {
  try {
    const ref = doc(db, 'empresas', empresaId);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data().nombreEmpresa;  
    return 'Empresa no encontrada';
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    return 'Error de empresa';
  }
};


export const actualizarUsuario = async (uid: string, nombre: string, apellidos: string) => {
  try {
    const ref = doc(db, 'usuarios', uid);
    await updateDoc(ref, { nombre, apellidos });
  } catch (error) {
    console.error('Error al actualizar nombre del usuario:', error);
    throw error;
  }
};

export const obtenerCitasPorUsuario = async (usuario: any) => {
  try {
    const citasRef = collection(db, 'citas');

    let q;
    if (usuario.rol === 'admin' || usuario.rol === 'company_admin') {
      q = query(citasRef);
    } else {
      q = query(citasRef, where('usuarioId', '==', usuario.id));
    }

    const querySnapshot = await getDocs(q);
    const citas = querySnapshot.docs.map(citaDoc => ({
      id: citaDoc.id,
      ...(citaDoc.data() as any),
    }));
    
    return citas;
  } catch (error) {
    console.error('Error obteniendo citas:', error);
    return [];
  }
};
