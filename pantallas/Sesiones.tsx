import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ImageBackground, Platform,  } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebase/firestoreService';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { useUsuario } from '../context/UsuarioContext';
import { Video, ResizeMode } from 'expo-av';
//import * as DocumentPicker from 'expo-document-picker';

const Sesiones = () => {
  const { usuario } = useUsuario();
  const [pacientes, setPacientes] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [sesionEditando, setSesionEditando] = useState(null);
  const [anotaciones, setAnotaciones] = useState('');
  const [ejercicios, setEjercicios] = useState('');
  const [fechaSesion, setFechaSesion] = useState(null);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('');
  const [documentosAdjuntos, setDocumentosAdjuntos] = useState([]);
  const navigation = useNavigation();
  const esWeb = Platform.OS === 'web';

  useEffect(() => {
    const cargarPacientes = async () => {
      const pacientesSnapshot = await getDocs(collection(db, 'pacientes'));
      setPacientes(pacientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    cargarPacientes();
  }, []);

  const cargarSesiones = async (pacienteId) => {
    const sesionesSnapshot = await getDocs(collection(db, 'sesiones'));
    const sesionesData = sesionesSnapshot.docs
      .filter(doc => doc.data().pacienteId === pacienteId)
      .map(doc => ({ id: doc.id, ...doc.data() }));
    setSesiones(sesionesData);
  };

  const handlePacientePress = (pacienteId) => {
    setPacienteSeleccionado(pacienteId);
    cargarSesiones(pacienteId);
  };

  const handleAñadirSesion = async () => {
    if (!anotaciones || !ejercicios || !fechaSesion) {
      alert('Por favor, complete los campos');
      return;
    }
    try {
      await addDoc(collection(db, 'sesiones'), {
        pacienteId: pacienteSeleccionado,
        anotacionesPrivadas: anotaciones,
        ejerciciosRealizados: [ejercicios],
        fecha: fechaSesion,
        estado: 'pendiente',
        documentosAdjuntos: documentosAdjuntos, 
      });
      alert('Sesión añadida');
      setModalVisible(false);
      cargarSesiones(pacienteSeleccionado);
    } catch (error) {
      console.error('Error al añadir sesión', error);
      alert('Error al añadir sesión');
    }
  };

  const handleEditarSesion = async () => {
    try {
      await updateDoc(doc(db, 'sesiones', sesionEditando.id), {
        anotacionesPrivadas: anotaciones,
        ejerciciosRealizados: [ejercicios],
        fecha: fechaSesion,
        documentosAdjuntos: documentosAdjuntos, 
      });
      alert('Sesión actualizada');
      setModalVisible(false);
      cargarSesiones(pacienteSeleccionado);
    } catch (error) {
      console.error('Error al editar sesión', error);
      alert('Error al editar sesión');
    }
  };

  const handleBorrarSesion = async (id) => {
    try {
      await deleteDoc(doc(db, 'sesiones', id));
      alert('Sesión eliminada');
      cargarSesiones(pacienteSeleccionado);
    } catch (error) {
      console.error('Error al borrar sesión', error);
      alert('Error al borrar sesión');
    }
  };

  // Función para seleccionar documentos

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#ffffff" />
          <Text style={styles.navText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Sesiones</Text>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Perfil')}
        >
          <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
          <Text style={styles.navText}>{usuario?.nombre || 'Perfil'}</Text>
        </TouchableOpacity>
      </View>

      {esWeb ? (
        <ImageBackground
          source={require('../assets/imagenes/imagenFondo.jpg')}
          style={styles.fondoImagen}
          resizeMode="cover"
        />
      ) : (
        <Video
          source={require('../assets/videos/fondoLogin.mp4')}
          rate={1.0}
          volume={1.0}
          isMuted
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      <FlatList
        data={pacientes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePacientePress(item.id)}
            style={styles.pacienteItem}
          >
            <Text style={styles.pacienteNombre}>{item.nombre} {item.apellido}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal para añadir o editar sesiones */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Añadir / Editar Sesión</Text>
            <TextInput
              style={styles.input}
              placeholder="Anotaciones privadas"
              value={anotaciones}
              onChangeText={setAnotaciones}
            />
            <TextInput
              style={styles.input}
              placeholder="Ejercicios realizados"
              value={ejercicios}
              onChangeText={setEjercicios}
            />
            <TextInput
              style={styles.input}
              placeholder="Fecha de sesión"
              value={fechaSesion ? moment(fechaSesion).format('YYYY-MM-DD') : ''}
              onChangeText={(text) => setFechaSesion(new Date(text))}
            />
            {/*Falta Boton de adjuntar archivo*/}
            <TouchableOpacity onPress={sesionEditando ? handleEditarSesion : handleAñadirSesion} style={styles.button}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <FlatList
        data={sesiones}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.sesionItem}>
            <Text>{moment(item.fecha.toDate()).format('D [de] MMMM [de] YYYY')}</Text>
            <Text>Anotaciones: {item.anotacionesPrivadas}</Text>
            <TouchableOpacity onPress={() => setSesionEditando(item)} style={styles.button}>
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleBorrarSesion(item.id)} style={styles.button}>
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  navbar: {
    height: 60,
    backgroundColor: '#2b7a78',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
  },
  navTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  pacienteItem: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pacienteNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sesionItem: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 5,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2b7a78',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2b7a78',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  iconButtonText: {
    marginLeft: 10,
    color: '#fff',
    fontSize: 16,
  },
  fondoImagen: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 60,
  },
    navItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 6,
  },
});

export default Sesiones;
