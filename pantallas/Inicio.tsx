import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Platform, Dimensions, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons'; 
import { useUsuario } from '../context/UsuarioContext';

import { useNavigation } from '@react-navigation/native';

export default function Inicio() {
  const { width } = useWindowDimensions();
  const botonSize = width < 500 ? 140 : 180;
  const navigation = useNavigation();
  const { usuario } = useUsuario();
  const esWeb = Platform.OS === 'web';

  return (
    
    <View style={styles.contenedor}>
          <View style={styles.navbar}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Inicio')}>
              <Ionicons name="home-outline" size={24} color="#ffffff" />
              <Text style={styles.navText}>Inicio</Text>
            </TouchableOpacity>
            <Text style={styles.navTitle}>Bienvenido a NeurogGestion</Text>
            <TouchableOpacity
      style={styles.navItem}
      onPress={() => navigation.navigate('Perfil')}
    >
      <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
      <Text style={styles.navText}>{usuario?.nombre || 'Perfil'}</Text>
    </TouchableOpacity>
          </View>

      {/* Fondo dinámico */}
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

      {/* Contenido */}
      <View style={styles.contenido}>
        <View style={styles.botonera}>
        <TouchableOpacity style={[styles.boton, { width: botonSize, height: botonSize }]} onPress={() => navigation.navigate('Pacientes')}>
            <Ionicons name="people-outline" size={50} color="#2b7a78" />
            <Text style={styles.botonTexto}>Pacientes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.boton, { width: botonSize, height: botonSize }]}>
            <Ionicons name="calendar-outline" size={50} color="#2b7a78" />
            <Text style={styles.botonTexto}>Citas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.boton, { width: botonSize, height: botonSize }]}>
            <Ionicons name="document-text-outline" size={50} color="#2b7a78" />
            <Text style={styles.botonTexto}>Documentos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.boton, { width: botonSize, height: botonSize }]}>
            <Ionicons name="folder-outline" size={50} color="#2b7a78" />
            <Text style={styles.botonTexto}>Sesiones</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  fondoImagen: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 60, 
  },
  contenido: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60, 
    zIndex: 1,
  },
  navbar: {
    height: 60,
    backgroundColor: '#2b7a78',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    zIndex: 2,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium', 
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  botonera: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 10,
  },
  
  boton: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    margin: 50,
    padding: 50,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  
  botonTexto: {
    marginTop: 10,
    fontSize: 16,
    color: '#2b7a78',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
