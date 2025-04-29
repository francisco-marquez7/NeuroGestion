import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, Dimensions, ImageBackground, Platform } from 'react-native';
import { iniciarSesion } from '../firebase/auth';
import { useUsuario } from '../context/UsuarioContext';
import { buscarUsuarioPorEmail } from '../firebase/firestoreService';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const { setUsuario } = useUsuario();
  const esWeb = Platform.OS === 'web';

  const manejarLogin = async () => {
    try {
      await iniciarSesion(email, clave);
      const datosUsuario = await buscarUsuarioPorEmail(email);
      if (datosUsuario) {
        setUsuario(datosUsuario);
      }

      Alert.alert('Inicio de sesión correcto', 'Sesión iniciada correctamente.');
      navigation.replace('Inicio');
    } catch (error: any) {
      Alert.alert('Error al iniciar sesión', 'El email o la contraseña son incorrectos.');
    }
  };

  return (
    <View style={estilos.contenedor}>
      {esWeb ? (
        <ImageBackground
          source={require('../assets/imagenes/imagenFondoLogin.png')}
          style={estilos.fondoWeb}
          resizeMode="cover"
        />
      ) : (
        <Video
          source={require('../assets/videos/fondoLogin4.mp4')}
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

      <View style={estilos.formulario}>
        <Text style={estilos.titulo}>NeuroGestión</Text>

        <TextInput
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          style={estilos.input}
          placeholderTextColor="#ccc"
        />

        <TextInput
          placeholder="Contraseña"
          value={clave}
          onChangeText={setClave}
          secureTextEntry
          style={estilos.input}
          placeholderTextColor="#ccc"
        />

        <View style={{ marginVertical: 10 }}>
          <Button title="Iniciar sesión" onPress={manejarLogin} color="#2b7a78" />
        </View>

        <View style={estilos.links}>
          <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
            <Text style={estilos.linkTexto}>Registrarse</Text>
          </TouchableOpacity>

          <Text style={estilos.separador}>|</Text>

          <TouchableOpacity onPress={() => navigation.navigate('RecuperarContraseña')}>
            <Text style={estilos.linkTexto}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fondoWeb: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  formulario: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.75)',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 1,
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#17252a',
    textAlign: 'center',
  },
  links: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  linkTexto: {
    color: '#2b7a78',
    marginHorizontal: 8,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  separador: {
    color: '#17252a',
    fontSize: 14,
  },
});