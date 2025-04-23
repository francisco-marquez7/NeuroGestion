import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, Platform, Dimensions, Animated, Modal, TextInput, Button, ScrollView } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { obtenerPacientes} from '../firebase/firestoreService';


const { width, height } = Dimensions.get('window');

export default function Pacientes({ navigation }: any) {
  const esWeb = Platform.OS === 'web';
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [alturaAnimada] = useState(new Animated.Value(180));

  useEffect(() => {
    const cargarPacientes = async () => {
      const datos = await obtenerPacientes();
      setPacientes(datos);
    };
    cargarPacientes();
  }, []);

  const manejarExpandir = (id: string) => {
    if (expandidoId === id) {
      Animated.timing(alturaAnimada, {
        toValue: 180,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setExpandidoId(null));
    } else {
      setExpandidoId(id);
      Animated.timing(alturaAnimada, {
        toValue: 360,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const calcularEdad = (fechaNacimiento: any) => {
    const hoy = new Date();
    const nacimiento = typeof fechaNacimiento.toDate === 'function'
      ? fechaNacimiento.toDate()
      : new Date(fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const renderPaciente = ({ item }: any) => {
    const expandido = expandidoId === item.id;
    const colorFondo = item.estado === 'Activo'
      ? 'rgba(46, 204, 113, 0.3)'
      : 'rgba(231, 76, 60, 0.3)';

    return (
      <Animated.View style={[styles.card, expandido && styles.cardExpandido, { backgroundColor: colorFondo, height: expandido ? alturaAnimada : 180 }]}>
        <TouchableOpacity onPress={() => manejarExpandir(item.id)} style={{ width: '100%', alignItems: 'center' }}>
          <Ionicons name="person-circle-outline" size={50} color="#2b7a78" />
          <Text style={styles.nombre}>{item.nombre} {item.apellidos}</Text>
          <Text style={styles.datosCentrado}>{calcularEdad(item.fechaNacimiento)} años</Text>
          <Text style={styles.datosCentrado}>{item.diagnostico}</Text>

          {expandido && (
            <View style={styles.detallesExtra}>
              <Text style={styles.datosCentrado}>DNI: {item.dni || '—'}</Text>
              <Text style={styles.datosCentrado}>Email: {item.email}</Text>
              <Text style={styles.datosCentrado}>Teléfono: {item.telefono}</Text>
              <Text style={styles.datosCentrado}>Beca: {item.beca ? `Sí (${item.tipoBeca || 'Sin especificar'})` : 'No'}</Text>
              <Text style={styles.datosCentrado}>Pagado: {item.pagado ? 'Sí' : 'No'}</Text>
              {item.pagado && (
                <>
                  <Text style={styles.datosCentrado}>Método: {item.metodoPago}</Text>
                  <Text style={styles.datosCentrado}>Recibo: {item.recibo ? 'Sí' : 'No'}</Text>
                </>
              )}
              <Text style={styles.datosCentrado}>Estado: {item.estado}</Text>

              <View style={styles.iconosAcciones}>
                <Ionicons name="create-outline" size={28} color="#2b7a78" style={styles.icono} />
                <Ionicons name="trash-outline" size={28} color="#e74c3c" style={styles.icono} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Inicio')}>
          <Ionicons name="home-outline" size={24} color="#ffffff" />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Pacientes</Text>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
          <Text style={styles.navText}>Usuario</Text>
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

      <View style={styles.contenido}>
        <FlatList
          data={pacientes}
          renderItem={renderPaciente}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.lista}
        />
        <Button
  title="➕ Añadir Paciente"
  onPress={() => navigation.navigate('AltaPaciente')}
  color="#2b7a78"
/>
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
  navbar: {
    height: 60,
    backgroundColor: '#2b7a78',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
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
  contenido: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    zIndex: 1,
  },
  lista: {
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: 150,
    height: 180,
    justifyContent: 'center',
    elevation: 5,
  },
  cardExpandido: {
    height: 'auto',
    width: 320,
    alignItems: 'center',
    padding: 25,
  },
  nombre: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2b7a78',
    textAlign: 'center',
  },
  datos: {
    fontSize: 14,
    color: '#555',
    textAlign: 'left',
    width: '100%',
    marginTop: 2,
  },
  datosCentrado: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 2,
  },
  detallesExtra: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  iconosAcciones: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 15,
  },
  icono: {
    marginHorizontal: 8,
  },
});
