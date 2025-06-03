import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { useUsuario } from '../context/UsuarioContext';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

export default function Inicio() {
  const { width } = useWindowDimensions();
  const botonSize = width < 500 ? 140 : 180;
type NavigationProp = StackNavigationProp<RootStackParamList, 'Inicio'>;
const navigation = useNavigation<NavigationProp>();
  const { usuario } = useUsuario();
  const esWeb = Platform.OS === 'web';

  return (
  <View style={{ flex: 1 }}>
    <ImageBackground
      source={require('../assets/imagenes/imagenFondo.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Inicio')}>
          <Ionicons name="home-outline" size={24} color="#ffffff" />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>NeuroGestión</Text>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Perfil')}>
          <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
          <Text style={styles.navText}>{usuario?.nombre || 'Perfil'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContenido}>
          <View style={styles.botonera}>
            {/* Botones */}
            <TouchableOpacity style={[styles.boton, { width: botonSize, height: botonSize }]} onPress={() => navigation.navigate('Pacientes')}>
              <Ionicons name="people-outline" size={50} color="#2b7a78" />
              <Text style={styles.botonTexto}>Pacientes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.boton, { width: botonSize, height: botonSize }]} onPress={() => navigation.navigate('CalendarioCitas')}>
              <Ionicons name="calendar-outline" size={50} color="#2b7a78" />
              <Text style={styles.botonTexto}>Citas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.boton, { width: botonSize, height: botonSize }]} onPress={() => navigation.navigate('Documentos')}>
              <Ionicons name="document-text-outline" size={50} color="#2b7a78" />
              <Text style={styles.botonTexto}>Documentos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.boton, { width: botonSize, height: botonSize }]} onPress={() => navigation.navigate('Sesiones')}>
              <Ionicons name="folder-outline" size={50} color="#2b7a78" />
              <Text style={styles.botonTexto}>Sesiones</Text>
            </TouchableOpacity>

            {usuario?.rol === 'admin' && (
              <TouchableOpacity style={[styles.boton, { width: botonSize, height: botonSize }]} onPress={() => navigation.navigate('Gestion')}>
                <Ionicons name="settings-outline" size={50} color="#2b7a78" />
                <Text style={styles.botonTexto}>Gestión</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  </View>
);
}

const styles = StyleSheet.create({
contenedor: {
  flex: 1,
},

scrollContenido: {
  paddingBottom: 40,
  paddingTop: 20,
  alignItems: 'center',
  justifyContent: 'center',
},

navbar: {
  height: 60,
  backgroundColor: '#2b7a78',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 15,
},

fondoImagen: {
  flex: 1,
  width: '100%',
  height: '100%',
},

  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navTitle: {
    color: '#ffffff',
    fontSize: 28,          
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
    textShadowColor: 'rgba(0, 0, 0, 0.4)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
