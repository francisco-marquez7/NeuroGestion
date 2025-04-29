import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ImageBackground} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useUsuario } from '../context/UsuarioContext';
import { obtenerCitasPorUsuario } from '../firebase/firestoreService'; 
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { LocaleConfig } from 'react-native-calendars';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firestoreService';


LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy'
};

LocaleConfig.defaultLocale = 'es';

export default function CalendarioCitas() {
  const { usuario } = useUsuario();
  const navigation = useNavigation();
  const [citas, setCitas] = useState<any[]>([]);
  const [marcaciones, setMarcaciones] = useState({});
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const esWeb = Platform.OS === 'web';

  useEffect(() => {
    if (usuario) {
      cargarCitas();
    }
  }, [usuario]);
  

  const cargarCitas = async () => {
    try {
      const citasUsuario = await obtenerCitasPorUsuario(usuario);

      const snapshotPacientes = await getDocs(collection(db, 'pacientes'));
const pacientesMap = new Map();
snapshotPacientes.docs.forEach(doc => {
  pacientesMap.set(doc.id, doc.data().nombre);
});

// Obtener usuarios
const snapshotUsuarios = await getDocs(collection(db, 'usuarios'));
const usuariosMap = new Map();
snapshotUsuarios.docs.forEach(doc => {
  const data = doc.data();
  const uid = data.uid || doc.id; // Si tienes uid guardado en el doc, úsalo
  usuariosMap.set(uid, data.nombre);
});

      // Añadir nombrePaciente y nombreProfesional a cada cita
      const citasConNombres = citasUsuario.map(cita => ({
        ...cita,
        nombrePaciente: pacientesMap.get(cita.pacienteId) || 'Paciente desconocido',
        nombreProfesional: usuariosMap.get(cita.usuarioId) || 'Profesional desconocido'
      }));
  
      setCitas(citasConNombres);
  
      const marcados: any = {};
      citasConNombres.forEach(cita => {
        const fecha = cita.fechaInicio.toDate().toISOString().split('T')[0];
        let color = '#FFD700';
        if (cita.estado === 'realizada') color = '#00C851';
        else if (cita.estado === 'cancelada') color = '#ff4444';
  
        marcados[fecha] = { marked: true, dotColor: color };
      });
      setMarcaciones(marcados);
  
    } catch (error) {
      console.error('Error al cargar citas:', error);
    }
  };

  const handleDiaPress = (day: any) => {
    setDiaSeleccionado(day.dateString);
  };

  return (
    <View style={styles.container}>
      {/* NavBar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#ffffff" />
          <Text style={styles.navText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Calendario de Citas</Text>
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

      {/* Calendario */}
      <View style={styles.calendarioWrapper}>
  <Calendar
    onDayPress={handleDiaPress}
    markedDates={marcaciones}
    theme={{
      todayTextColor: '#2b7a78',
      selectedDayBackgroundColor: '#2b7a78',
      arrowColor: '#2b7a78',
    }}
  />
</View>

      {/* Si un día está seleccionado */}
      {diaSeleccionado && (
        <ScrollView style={styles.citasDiaContainer}>
          <Text style={styles.tituloDia}>Citas del {diaSeleccionado}</Text>
          {citas.filter(cita => cita.fechaInicio.toDate().toISOString().split('T')[0] === diaSeleccionado)
            .map((cita, index) => (
              <View key={index} style={styles.citaItem}>
                <Text style={styles.citaHora}>
                {new Date(cita.fechaInicio.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(cita.fechaFin.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.citaMotivo}>{cita.nombrePaciente} (con {cita.nombreProfesional})</Text>

              </View>
            ))
          }
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {   flex: 1,
    backgroundColor: 'transparent',
    position: 'relative', },
  navbar: {
    height: 60,
    backgroundColor: '#2b7a78',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
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
  navTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  citasDiaContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  tituloDia: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2b7a78',
  },
  citaItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },
  citaHora: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2b7a78',
  },
  citaMotivo: {
    fontSize: 14,
    color: '#333333',
  },
  calendarioWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingBottom: 20,
  },
  
});
