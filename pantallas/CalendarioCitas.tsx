import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ImageBackground} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useUsuario } from '../context/UsuarioContext';
import { obtenerCitasPorUsuario } from '../firebase/firestoreService'; 
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { LocaleConfig } from 'react-native-calendars';
import { collection, getDocs, addDoc} from 'firebase/firestore';
import { db } from '../firebase/firestoreService';
import { Modal, Button } from 'react-native';
import moment from 'moment';
import 'moment/locale/es';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [mostrarPickerInicio, setMostrarPickerInicio] = useState(false);
  const [mostrarPickerFin, setMostrarPickerFin] = useState(false);

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

const snapshotUsuarios = await getDocs(collection(db, 'usuarios'));
const usuariosMap = new Map();
snapshotUsuarios.docs.forEach(doc => {
  const data = doc.data();
  const uid = data.uid || doc.id; 
  usuariosMap.set(doc.id, data.nombre);
});
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

  useEffect(() => {
    const cargarListas = async () => {
      const snapPac = await getDocs(collection(db, 'pacientes'));
      setPacientes(snapPac.docs.map(doc => ({ id: doc.id, nombre: doc.data().nombre })));
  
      const snapUser = await getDocs(collection(db, 'usuarios'));
      setUsuarios(snapUser.docs.map(doc => ({ id: doc.id, nombre: doc.data().nombre })));
    };
    cargarListas();
  }, []);
  
  const handleDiaPress = (day: any) => {
    setDiaSeleccionado(day.dateString);
  };

  const guardarCita = async () => {
    if (!pacienteSeleccionado || !usuarioSeleccionado) {
      alert('Faltan datos');
      return;
    }
  
    try {
      await addDoc(collection(db, 'citas'), {
        pacienteId: pacienteSeleccionado,
        usuarioId: usuarioSeleccionado,
        fechaInicio,
        fechaFin,
        estado: 'pendiente',
      });
  
      alert('Cita añadida correctamente');
      setModalVisible(false);
      cargarCitas(); 
    } catch (error) {
      console.error('Error al guardar cita:', error);
      alert('Error al guardar');
    }
  };
  

  return (
    <View style={styles.container}>
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
      {diaSeleccionado && (
        <ScrollView style={styles.citasDiaContainer}>
          <Text style={styles.tituloDia}>
  Citas del {moment(diaSeleccionado).format('D [de] MMMM [de] YYYY')}
</Text>
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
      <TouchableOpacity
  style={{
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2b7a78',
    padding: 15,
    borderRadius: 30,
  }}
  onPress={() => setModalVisible(true)}
>
  <Ionicons name="add" size={24} color="#fff" />
</TouchableOpacity>
<Modal visible={modalVisible} transparent animationType="slide">
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 }}>
  <View style={{
  backgroundColor: 'white',
  padding: 20,
  borderRadius: 10,
  maxWidth: 500,
  width: '100%',
  alignSelf: 'center',
}}>

<Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2b7a78' }}>
  Añadir Cita
</Text>
      <Text>Paciente:</Text>
      <Picker selectedValue={pacienteSeleccionado} onValueChange={(itemValue) => setPacienteSeleccionado(itemValue)}>
        {pacientes.map(p => <Picker.Item key={p.id} label={p.nombre} value={p.id} />)}
      </Picker>

      <Text>Profesional:</Text>
      <Picker selectedValue={usuarioSeleccionado} onValueChange={(itemValue) => setUsuarioSeleccionado(itemValue)}>
        {usuarios.map(u => <Picker.Item key={u.id} label={u.nombre} value={u.id} />)}
      </Picker>

      <Text>Inicio:</Text>
      <TouchableOpacity style={styles.fechaInput} onPress={() => setMostrarPickerInicio(true)}>
      <Text style={styles.fechaTexto}>
  {fechaInicio ? moment(fechaInicio).format('D/M/YYYY, HH:mm') : 'Seleccionar fecha de inicio'}
</Text>

      </TouchableOpacity>

      <Text>Fin:</Text>
      <TouchableOpacity style={styles.fechaInput} onPress={() => setMostrarPickerFin(true)}>
      <Text style={styles.fechaTexto}>
  {fechaFin ? moment(fechaFin).format('D/M/YYYY, HH:mm') : 'Seleccionar fecha de fin'}
</Text>

      </TouchableOpacity>

      <TouchableOpacity style={styles.botonGuardar} onPress={guardarCita}>
        <Text style={styles.textoBoton}>GUARDAR CITA</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonCancelar} onPress={() => setModalVisible(false)}>
        <Text style={styles.textoBoton}>CANCELAR</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
<DateTimePickerModal
  isVisible={mostrarPickerInicio}
  mode="datetime"
  date={fechaInicio || new Date()}
  onConfirm={(date) => {
    setFechaInicio(date);
    setMostrarPickerInicio(false);
  }}
  onCancel={() => setMostrarPickerInicio(false)}
/>

<DateTimePickerModal
  isVisible={mostrarPickerFin}
  mode="datetime"
  date={fechaFin || new Date()}
  onConfirm={(date) => {
    setFechaFin(date);
    setMostrarPickerFin(false);
  }}
  onCancel={() => setMostrarPickerFin(false)}
/>

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
    marginTop: 10,
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
    backgroundColor: 'transparent',
    paddingBottom: 10,
  },
  fechaInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  fechaTexto: {
    fontSize: 16,
    color: '#333',
  }, 
  botonGuardar: {
    backgroundColor: '#2b7a78',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  botonCancelar: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
   
});
