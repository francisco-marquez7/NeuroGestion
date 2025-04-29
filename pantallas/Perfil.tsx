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
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUsuario } from '../context/UsuarioContext';
import { actualizarUsuario, obtenerNombreEmpresaPorId } from '../firebase/firestoreService';
import { cerrarSesion } from '../firebase/auth';
import { Alert } from 'react-native';



const { width } = Dimensions.get('window');

export default function Perfil() {
  const navigation = useNavigation();
  const { usuario, setUsuario } = useUsuario();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [apellidos, setApellidos] = useState(usuario?.apellidos || '');
  const [empresaNombre, setEmpresaNombre] = useState('');

  useEffect(() => {
    const cargarNombreEmpresa = async () => {
      if (usuario?.empresaId) {
        const nombreEmpresa = await obtenerNombreEmpresaPorId(usuario.empresaId);
        setEmpresaNombre(nombreEmpresa || 'Empresa desconocida');
      }
    };
    cargarNombreEmpresa();
  }, [usuario]);


  const manejarCerrarSesion = () => {
    Alert.alert(
      '¿Cerrar sesión?',
      'Tu sesión se cerrará y volverás al inicio. ¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await cerrarSesion();     
              setUsuario(null);          
              navigation.replace('Login');
            } catch (error) {
              alert('Error cerrando sesión');
            }
          }
        }
      ],
      { cancelable: true }
    );
  };  

  const guardarCambios = async () => {
    try {
      await actualizarUsuario(usuario!.id, nombre, apellidos);
      setUsuario({ ...usuario!, nombre, apellidos });
      setEditando(false);
    } catch (error) {
      alert('Error al guardar los cambios');
    }
  };

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
      <View style={styles.nombreFila}>
        <View>
          <Text style={styles.label}>Nombre:</Text>
          {editando ? (
            <TextInput value={nombre} onChangeText={setNombre} style={styles.input} />
          ) : (
            <Text style={styles.info}>{usuario.nombre}</Text>
          )}
        </View>
        <TouchableOpacity onPress={manejarCerrarSesion} style={styles.logoutIcon}>
          <Ionicons name="log-out-outline" size={28} color="#2b7a78" />
        </TouchableOpacity>
      </View>

      {/* El resto del formulario */}
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
            <Button title="Cancelar" onPress={() => setEditando(false)} color="#e74c3c" />
          </>
        ) : (
          <Button title="Editar" onPress={() => setEditando(true)} color="#2b7a78" />
        )}
      </View>

    </View>
  </ScrollView>
</KeyboardAvoidingView>
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
});
