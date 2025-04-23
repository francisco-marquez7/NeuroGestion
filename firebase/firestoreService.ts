import { getFirestore, collection, getDocs, addDoc} from 'firebase/firestore';
import { app } from './firebaseConfig';

// Exportamos instancia de la base de datos
export const db = getFirestore(app);

// Función para obtener todos los pacientes
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
