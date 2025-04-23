import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { registrarUsuario, comprobarUsuarioExistente } from '../firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Asegúrate de tener instalado @expo/vector-icons

const { width, height } = Dimensions.get('window');

export default function Registro() {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const navigation = useNavigation();

  const manejarRegistro = async () => {
    if (!email || !clave) {
      Alert.alert('Error', 'Por favor, ingrese un correo electrónico y una contraseña.');
      return;
    }

    if (clave.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      const usuarioExistente = await comprobarUsuarioExistente(email);
      if (usuarioExistente) {
        Alert.alert('Error', 'El correo electrónico ya está registrado.');
        return;
      }

      await registrarUsuario(email, clave);
      Alert.alert('Usuario creado', 'El usuario se ha registrado correctamente.');
      navigation.replace('Login');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'El correo electrónico ya está en uso.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'El correo electrónico no es válido.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'La contraseña es demasiado débil.');
      } else {
        Alert.alert('Error al registrarse', error.message);
      }
    }
  };

  return (
    <View style={styles.contenedor}>

<Video
  source={require('../assets/videos/fondoLogin.mp4')}
  rate={1.0}
  volume={1.0}
  isMuted
  resizeMode={ResizeMode.COVER}
  shouldPlay
  isLooping
  style={[
    StyleSheet.absoluteFillObject,
    {
      transform: [{ translateX: -50 }],
    },
  ]}
  pointerEvents="none" 
/>


      {/* Barra superior */}
      <View style={styles.barraSuperior}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.tituloBarra}>Login</Text>
      </View>

      {/* Formulario */}
      <View style={styles.formulario}>
        <Text style={styles.titulo}>Registro</Text>

        <TextInput
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#ccc"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Contraseña"
          value={clave}
          onChangeText={setClave}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#ccc"
        />

        <View style={{ marginVertical: 10 }}>
          <Button title="Registrar" onPress={manejarRegistro} color="#2b7a78" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#000', // De fondo negro mientras carga el video
    justifyContent: 'center',
    alignItems: 'center',
  },
  barraSuperior: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  tituloBarra: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  formulario: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 100,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#17252a',
    textAlign: 'center',
  },
});
