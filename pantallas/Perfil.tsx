import React, { useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Button,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  ImageBackground,
  Modal, Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUsuario } from '../context/UsuarioContext';
import { actualizarUsuario, obtenerNombreEmpresaPorId } from '../firebase/firestoreService';
import { cerrarSesion } from '../firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

export default function Perfil() {
  const { usuario, setUsuario } = useUsuario();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [apellidos, setApellidos] = useState(usuario?.apellidos || '');
  const [empresaNombre, setEmpresaNombre] = useState('');
const [modalCerrarSesionVisible, setModalCerrarSesionVisible] = useState(false);
type NavigationProp = StackNavigationProp<RootStackParamList, 'Perfil'>;
const navigation = useNavigation<NavigationProp>();

const manejarCerrarSesion = () => {
  setModalCerrarSesionVisible(true);
};

const confirmarCerrarSesion = async () => {
  try {
    await cerrarSesion();
    setUsuario(null);
    setModalCerrarSesionVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  } catch (error) {
    alert('Error cerrando sesión');
  }
};
  useEffect(() => {
    const cargarNombreEmpresa = async () => {
      if (usuario?.empresaId) {
        const nombreEmpresa = await obtenerNombreEmpresaPorId(usuario.empresaId);
        setEmpresaNombre(nombreEmpresa || 'Empresa desconocida');
      }
    };
    cargarNombreEmpresa();
  }, [usuario]);


const guardarCambios = async () => {
  try {
    await actualizarUsuario(usuario!.id, { nombre, apellidos });
    setUsuario({ ...usuario!, nombre, apellidos });
    setEditando(false);
  } catch (error) {
    alert('Error al guardar los cambios');
  }
}

  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No hay usuario cargado</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/imagenes/imagenFondo.jpg')}
      style={styles.fondo}
      resizeMode="cover"
    >
      <View style={styles.navbar}>
  <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back-outline" size={24} color="#ffffff" />
    <Text style={styles.navText}>Volver</Text>
  </TouchableOpacity>
  <Text style={styles.navTitle}>Perfil</Text>
  <View style={styles.navItem}>
    <Text style={styles.navText}>Hola, {usuario.nombre}</Text>
    <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
  </View>
</View>

<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.card}>
      {editando && (
  <TouchableOpacity
    style={styles.closeButton}
    onPress={() => setEditando(false)}
    accessible={true}
    accessibilityLabel="Cerrar edición"
  >
    <Ionicons name="close" size={28} color="#e74c3c" />
  </TouchableOpacity>
)}
      <View style={styles.nombreFila}>
        <View>
          <Text style={styles.label}>Nombre:</Text>
          {editando ? (
            <TextInput value={nombre} onChangeText={setNombre} style={styles.input} />
          ) : (
            <Text style={styles.info}>{usuario.nombre}</Text>
          )}
        </View>
        {!editando && (
  <TouchableOpacity onPress={manejarCerrarSesion} style={styles.logoutIcon} accessibilityLabel="Cerrar sesión">
    <Ionicons name="log-out-outline" size={28} color="#2b7a78" />
  </TouchableOpacity>
)}
      </View>
      <Text style={styles.label}>Apellidos:</Text>
      {editando ? (
        <TextInput value={apellidos} onChangeText={setApellidos} style={styles.input} />
      ) : (
        <Text style={styles.info}>{usuario.apellidos || '-'}</Text>
      )}

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.info}>{usuario.email}</Text>

      <Text style={styles.label}>Empresa:</Text>
      <Text style={styles.info}>{empresaNombre}</Text>

      <Text style={styles.label}>Rol:</Text>
      <Text style={styles.info}>{usuario.rol}</Text>

      <View style={styles.botonera}>
        {editando ? (
          <>
            <Button title="Guardar" onPress={guardarCambios} color="#2b7a78" />
          </>
        ) : (
          <Button title="Editar" onPress={() => setEditando(true)} color="#2b7a78" />
        )}
      </View>

    </View>
  </ScrollView>
</KeyboardAvoidingView>
<Modal
  transparent
  visible={modalCerrarSesionVisible}
  animationType="fade"
  onRequestClose={() => setModalCerrarSesionVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalText}>¿Estas seguro que quieres cerrar la sesion?</Text>
      <View style={styles.modalButtons}>
        <Pressable
          style={[styles.modalButton, styles.cancelButton]}
          onPress={() => setModalCerrarSesionVisible(false)}
        >
          <Text style={styles.buttonText}>No</Text>
        </Pressable>
        <Pressable
          style={[styles.modalButton, styles.confirmButton]}
          onPress={confirmarCerrarSesion}
        >
          <Text style={styles.buttonText}>Sí, cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  </View>
</Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  navbar: {
    height: 60,
    backgroundColor: '#2b7a78',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
    zIndex: 2,
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
  navTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    opacity: 0.85,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2b7a78',
    marginTop: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 8,
    fontSize: 16,
    color: '#333',
  },
  botonera: {
    marginTop: 20,
    gap: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  nombreFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutIcon: {
    marginLeft: 10,
  },  
  closeButton: {
  position: 'absolute',
  top: 12,
  right: 12,
  zIndex: 10,
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 20,
  width: '80%',
  maxWidth: 320,
  alignItems: 'center',
},
modalText: {
  fontSize: 16,
  marginBottom: 20,
  textAlign: 'center',
  color: '#333',
},
modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
},
modalButton: {
  flex: 1,
  paddingVertical: 10,
  marginHorizontal: 5,
  borderRadius: 6,
  alignItems: 'center',
},
cancelButton: {
  backgroundColor: '#e74c3c',
},
confirmButton: {
  backgroundColor: '#2b7a78',
},
buttonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},

});
