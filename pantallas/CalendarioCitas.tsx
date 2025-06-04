import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ImageBackground, TextInput, FlatList, Alert} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useUsuario } from '../context/UsuarioContext';
import { obtenerCitasPorUsuario } from '../firebase/firestoreService'; 
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { LocaleConfig } from 'react-native-calendars';
import { collection, getDocs, addDoc, Timestamp, deleteDoc, updateDoc, doc} from 'firebase/firestore';
import { db } from '../firebase/firestoreService';
import { Modal} from 'react-native';
import moment from 'moment';
import 'moment/locale/es';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';


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
type NavigationProp = StackNavigationProp<RootStackParamList, 'CalendarioCitas'>;
const navigation = useNavigation<NavigationProp>();
  const [citas, setCitas] = useState<any[]>([]);
  const [marcaciones, setMarcaciones] = useState({});
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const esWeb = Platform.OS === 'web';
  const [modalVisible, setModalVisible] = useState(false);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busquedaProfesional, setBusquedaProfesional] = useState('');
  const [mostrarSugerenciasProfesional, setMostrarSugerenciasProfesional] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [mostrarPickerInicio, setMostrarPickerInicio] = useState(false);
  const [mostrarPickerFin, setMostrarPickerFin] = useState(false);
  const [estadoCita, setEstadoCita] = useState('pendiente');
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [citaEditando, setCitaEditando] = useState(null);


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
const citasConNombres = citasUsuario
.filter(cita => cita.fechaInicio && cita.fechaFin)
.map(cita => ({
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
    if (
        !pacienteSeleccionado ||
        !usuarioSeleccionado ||
        fechaInicio == null ||
        fechaFin == null
    ) {
        alert('Faltan datos obligatorios');
        return;
    }
    
    if (fechaInicio > fechaFin) {
        alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
        return;
    }

    try {
        await addDoc(collection(db, 'citas'), {
            pacienteId: pacienteSeleccionado,
            usuarioId: usuarioSeleccionado,
            fechaInicio: Timestamp.fromDate(fechaInicio),
            fechaFin: Timestamp.fromDate(fechaFin),
            estado: estadoCita,
        });

        alert('Cita añadida correctamente');
        setModalVisible(false);
        cargarCitas();

        setPacienteSeleccionado('');
        setUsuarioSeleccionado('');
        setFechaInicio(null);
        setFechaFin(null);
        setEstadoCita('pendiente');
        setBusquedaPaciente('');
        setBusquedaProfesional('');
    } catch (error) {
        console.error('Error al guardar cita:', error);
        alert('Error al guardar');
    }
}


  const abrirModalEditar = (cita) => {
    setPacienteSeleccionado(cita.pacienteId);
    setUsuarioSeleccionado(cita.usuarioId);
    setFechaInicio(cita.fechaInicio.toDate());
    setFechaFin(cita.fechaFin.toDate());
    setEstadoCita(cita.estado);
    setCitaEditando(cita);
    setModalEditarVisible(true);
  };
  
  const eliminarCita = async (id) => {
    try {
      await deleteDoc(doc(db, 'citas', id));
      alert('Cita eliminada');
      cargarCitas();
    } catch (e) {
      alert('Error al eliminar');
    }
  };
  const confirmarEliminarCita = (id: string) => {
  if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro de que quieres eliminar esta Cita')) {
        eliminarCita(id);
      }
    } else {
      Alert.alert(
        'Confirmar eliminación',
        '¿Estás seguro de que quieres eliminar esta Cita?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => eliminarCita(id) },
        ],
        { cancelable: true }
      );
    }
};

const yaExisteCitaParaPaciente = () => {
  return citas.some(c =>
    c.pacienteId === pacienteSeleccionado &&
    c.fechaInicio.toDate().getTime() === fechaInicio?.getTime()
  );
};

  
  const guardarEdicion = async () => {
      if (yaExisteCitaParaPaciente()) {
    alert('Este paciente ya tiene una cita a esta hora.');
    return;
  }
    if (!citaEditando) return;
    try {
      await updateDoc(doc(db, 'citas', citaEditando.id), {
        pacienteId: pacienteSeleccionado,
        usuarioId: usuarioSeleccionado,
        fechaInicio: Timestamp.fromDate(fechaInicio),
        fechaFin: Timestamp.fromDate(fechaFin),
        estado: estadoCita
      });
      alert('Cita modificada');
      setModalEditarVisible(false);
      cargarCitas();
    } catch (e) {
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
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Perfil')}>
                        <Text style={styles.navText}>{usuario?.nombre || 'Perfil'}</Text>
                        <Ionicons name="person-circle-outline" size={28} color="#fff" />
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
{citas.filter(cita =>
  cita.fechaInicio &&
  cita.fechaInicio.toDate().toISOString().split('T')[0] === diaSeleccionado
)          
            .map((cita, index) => (
    <View key={index} style={styles.citaItem}>
  <View style={{ flex: 1 }}>
    <Text style={styles.citaHora}>
      {new Date(cita.fechaInicio.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(cita.fechaFin.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </Text>
    <Text style={styles.citaMotivo}>
      {cita.nombrePaciente} (con {cita.nombreProfesional})
    </Text>
  </View>

  <View style={styles.iconosAcciones}>
    <TouchableOpacity onPress={() => abrirModalEditar(cita)}>
      <Ionicons name="create-outline" size={22} color="#2b7a78" />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => confirmarEliminarCita(cita.id)}>
      <Ionicons name="trash-outline" size={22} color="red" style={{ marginLeft: 10 }} />
    </TouchableOpacity>
  </View>
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
      <View style={styles.bloqueCampo}>
    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Paciente:</Text>
    <TextInput
        style={styles.inputWeb}
        placeholder="Buscar paciente..."
        value={busquedaPaciente}
        onChangeText={(text) => {
            setBusquedaPaciente(text);
            setMostrarSugerencias(true);
        }}
    />
    {mostrarSugerencias && (
        <FlatList
            data={pacientes.filter(p =>
  `${p.nombre.toLowerCase()} ${p.apellidos?.toLowerCase() || ''}`.includes(busquedaPaciente.toLowerCase())
)
}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => {
                        setPacienteSeleccionado(item.id);
                        setBusquedaPaciente(item.nombre);
                        setMostrarSugerencias(false);
                    }}
                >
                    <Text style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                        {item.nombre}
                    </Text>
                </TouchableOpacity>
            )}
            style={{ maxHeight: 120, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
        />
    )}
</View>
      <View style={styles.bloqueCampo}>
    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Profesional:</Text>
    <TextInput
        style={styles.inputWeb}
        placeholder="Buscar profesional..."
        value={busquedaProfesional}
        onChangeText={(text) => {
            setBusquedaProfesional(text);
            setMostrarSugerenciasProfesional(true);
        }}
    />
    {mostrarSugerenciasProfesional && (
        <FlatList
            data={usuarios.filter(u => u.nombre.toLowerCase().includes(busquedaProfesional.toLowerCase()))}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => {
                        setUsuarioSeleccionado(item.id);
                        setBusquedaProfesional(item.nombre);
                        setMostrarSugerenciasProfesional(false);
                    }}
                >
                    <Text style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                        {item.nombre}
                    </Text>
                </TouchableOpacity>
            )}
            style={{ maxHeight: 120, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
        />
    )}
</View>
<View style={styles.bloqueCampo}>
    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Estado:</Text>
    <Picker
        selectedValue={estadoCita}
        onValueChange={(itemValue) => setEstadoCita(itemValue)}
    >
        <Picker.Item label="Pendiente" value="pendiente" />
        <Picker.Item label="Realizada" value="realizada" />
        <Picker.Item label="Cancelada" value="cancelada" />
    </Picker>
</View>

<View style={styles.bloqueCampo}>
    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Fecha de inicio:</Text>
    {esWeb ? (
        <input
            type="datetime-local"
            value={fechaInicio ? moment(fechaInicio).format('YYYY-MM-DDTHH:mm') : ''}
            onChange={(e) => {
                const inputValue = e.target.value;
                const parsedDate = new Date(inputValue);
                if (inputValue && !isNaN(parsedDate.getTime())) {
                    setFechaInicio(parsedDate);
                } else {
                    setFechaInicio(null);
                }
            }}
            style={styles.inputWeb}
        />
    ) : (
        <TouchableOpacity style={styles.fechaInput} onPress={() => setMostrarPickerInicio(true)}>
            <Text style={styles.fechaTexto}>
                {fechaInicio ? moment(fechaInicio).format('D/M/YYYY, HH:mm') : 'Seleccionar fecha de inicio'}
            </Text>
        </TouchableOpacity>
    )}
</View>

<View style={styles.bloqueCampo}>
    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Fecha de fin:</Text>
    {esWeb ? (
        <input
            type="datetime-local"
            value={fechaFin ? moment(fechaFin).format('YYYY-MM-DDTHH:mm') : ''}
            onChange={(e) => {
                const inputValue = e.target.value;
                const parsedDate = new Date(inputValue);
                if (inputValue && !isNaN(parsedDate.getTime())) {
                    setFechaFin(parsedDate);
                } else {
                    setFechaFin(null);
                }
            }}
            style={styles.inputWeb}
        />
    ) : (
        <TouchableOpacity style={styles.fechaInput} onPress={() => setMostrarPickerFin(true)}>
            <Text style={styles.fechaTexto}>
                {fechaFin ? moment(fechaFin).format('D/M/YYYY, HH:mm') : 'Seleccionar fecha de fin'}
            </Text>
        </TouchableOpacity>
    )}
</View>

<TouchableOpacity style={styles.botonGuardar} onPress={guardarCita}>
    <Text style={styles.textoBoton}>GUARDAR CITA</Text>
</TouchableOpacity>
<View style={{ position: 'absolute', top: 10, right: 10 }}>
  <TouchableOpacity onPress={() => setModalVisible(false)}>
    <Ionicons name="close-circle" size={28} color="#e74c3c" />
  </TouchableOpacity>
</View>
    </View>
  </View>
</Modal>
<Modal visible={modalEditarVisible} transparent animationType="slide">
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 }}>
    <View style={{
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      maxWidth: 500,
      width: '100%',
      alignSelf: 'center',
    }}>
      {/* Icono cerrar */}
      <View style={{ position: 'absolute', top: 10, right: 10 }}>
        <TouchableOpacity onPress={() => setModalEditarVisible(false)}>
          <Ionicons name="close-circle" size={28} color="#e74c3c" />
        </TouchableOpacity>
      </View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2b7a78' }}>
                Editar Cita
            </Text>
            <Text>Paciente:</Text>
            <Picker
                selectedValue={pacienteSeleccionado}
                onValueChange={(itemValue) => setPacienteSeleccionado(itemValue)}
            >
                {pacientes.map(p => <Picker.Item key={p.id} label={p.nombre} value={p.id} />)}
            </Picker>
            <Text>Profesional:</Text>
            <Picker
                selectedValue={usuarioSeleccionado}
                onValueChange={(itemValue) => setUsuarioSeleccionado(itemValue)}
            >
                {usuarios.map(u => <Picker.Item key={u.id} label={u.nombre} value={u.id} />)}
            </Picker>
            <Text>Estado:</Text>
            <Picker
                selectedValue={estadoCita}
                onValueChange={(itemValue) => setEstadoCita(itemValue)}
            >
                <Picker.Item label="Pendiente" value="pendiente" />
                <Picker.Item label="Realizada" value="realizada" />
                <Picker.Item label="Cancelada" value="cancelada" />
            </Picker>
            <Text>Fecha de inicio:</Text>
            {esWeb ? (
                <input
                    type="datetime-local"
                    value={fechaInicio ? moment(fechaInicio).format('YYYY-MM-DDTHH:mm') : ''}
                    onChange={(e) => {
                        const inputValue = e.target.value;
                        const parsedDate = new Date(inputValue);
                        if (inputValue && !isNaN(parsedDate.getTime())) {
                            setFechaInicio(parsedDate);
                        } else {
                            setFechaInicio(null);
                        }
                    }}
                    style={styles.inputWeb}
                />
            ) : (
                <TouchableOpacity style={styles.fechaInput} onPress={() => setMostrarPickerInicio(true)}>
                    <Text style={styles.fechaTexto}>
                        {fechaInicio ? moment(fechaInicio).format('D/M/YYYY, HH:mm') : 'Seleccionar fecha de inicio'}
                    </Text>
                </TouchableOpacity>
            )}
            <Text>Fecha de fin:</Text>
            {esWeb ? (
                <input
                    type="datetime-local"
                    value={fechaFin ? moment(fechaFin).format('YYYY-MM-DDTHH:mm') : ''}
                    onChange={(e) => {
                        const inputValue = e.target.value;
                        const parsedDate = new Date(inputValue);
                        if (inputValue && !isNaN(parsedDate.getTime())) {
                            setFechaFin(parsedDate);
                        } else {
                            setFechaFin(null);
                        }
                    }}
                    style={styles.inputWeb}
                />
            ) : (
                <TouchableOpacity style={styles.fechaInput} onPress={() => setMostrarPickerFin(true)}>
                    <Text style={styles.fechaTexto}>
                        {fechaFin ? moment(fechaFin).format('D/M/YYYY, HH:mm') : 'Seleccionar fecha de fin'}
                    </Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.botonGuardar} onPress={guardarEdicion}>
                <Text style={styles.textoBoton}>GUARDAR CAMBIOS</Text>
            </TouchableOpacity>
        </View>
    </View>
</Modal>
{!esWeb && (
  <>
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
  </>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  inputWeb: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
},
bloqueCampo: {
    marginBottom: 15,
},
iconosAcciones: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginLeft: 10,
  gap: 10,
},
});
