import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet, ImageBackground, Platform, Dimensions } from 'react-native';
import { recuperarContraseña } from '../firebase/auth'; 
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');
const esWeb = Platform.OS === 'web';

export default function RecuperarContraseña({ navigation }: any) {
  const [email, setEmail] = useState('');

  const manejarRecuperar = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor, ingrese su correo electrónico.');
      return;
    }

    try {
      await recuperarContraseña(email);
      Alert.alert('Éxito', 'Se ha enviado un correo para recuperar la contraseña.');
      navigation.replace('Login');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.contenedor}>
      
      {/* 🔵 Fondo dinámico */}
      {esWeb ? (
        <ImageBackground
          source={require('../assets/imagenes/imagenFondoLogin.png')}
          style={StyleSheet.absoluteFill}
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

      {/* 🔵 Formulario */}
      <View style={styles.formulario}>
        <Text style={styles.titulo}>Recuperar Contraseña</Text>

        <TextInput
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#ccc"
        />

        <View style={{ marginVertical: 10 }}>
          <Button title="Enviar correo" onPress={manejarRecuperar} color="#2b7a78" />
        </View>
      <View style={styles.volverContainer}>
        <Text style={styles.volverTexto} onPress={() => navigation.navigate('Login')}>
          Iniciar Sesion
        </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#17252a',
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  volverContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  volverTexto: {
    color: '#2b7a78',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  
});
