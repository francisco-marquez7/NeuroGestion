import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ImageBackground, Platform, ScrollView, Linking,Switch } from 'react-native';
import { Ionicons} from '@expo/vector-icons';
import { db } from '../firebase/firestoreService';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { useUsuario } from '../context/UsuarioContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

const Sesiones = () => {
  const { usuario } = useUsuario();

  const [pacientes, setPacientes] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [sesionEditando, setSesionEditando] = useState(null);
  const [anotaciones, setAnotaciones] = useState('');
  const [ejercicios, setEjercicios] = useState('');
  const [fechaSesion, setFechaSesion] = useState(null);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [documentosAdjuntos, setDocumentosAdjuntos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarPickerFecha, setMostrarPickerFecha] = useState(false);
type NavigationProp = StackNavigationProp<RootStackParamList, 'Sesiones'>;
const navigation = useNavigation<NavigationProp>();
  const esWeb = Platform.OS === 'web';
  const [pagado, setPagado] = useState(false);


  useEffect(() => {
    const cargarPacientes = async () => {
      const pacientesSnapshot = await getDocs(collection(db, 'pacientes'));
      const data = pacientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPacientes(data);
    };
    cargarPacientes();
  }, []);

  const cargarSesiones = async (pacienteId) => {
    if (!pacienteId) return;
    const sesionesSnapshot = await getDocs(collection(db, 'sesiones'));
    const sesionesData = sesionesSnapshot.docs
      .filter(doc => doc.data().pacienteId === pacienteId)
      .map(doc => ({ id: doc.id, ...doc.data() }));
    setSesiones(sesionesData);
  };

  const handlePacientePress = (paciente) => {
    setPacienteSeleccionado(paciente);
    cargarSesiones(paciente.id);
  };

  const renderBuscadorYLista = () => (
  <>
    <TextInput
      style={styles.searchInput}
      placeholder="Buscar paciente..."
      value={busqueda}
      onChangeText={setBusqueda}
    />
    <FlatList
      data={pacientesFiltrados}
      keyExtractor={item => item.id}
      style={{ marginTop: 10 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.pacienteItem,
            pacienteSeleccionado?.id === item.id && styles.pacienteSeleccionado,
          ]}
          onPress={() => handlePacientePress(item)}
        >
          <Text style={styles.pacienteNombre}>
            {[item.nombre, item.apellido].filter(Boolean).join(' ')}
          </Text>
          <View style={styles.badgeSesiones}>
            <Text style={styles.badgeText}>
              {sesiones.filter(s => s.pacienteId === item.id).length}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  </>
);

const renderDetalleYSesiones = () => (
  pacienteSeleccionado ? (
    <View style={{ flex: 1 }}>
      <View style={styles.detallePaciente}>
        <Ionicons name="person-circle" size={80} color="#2b7a78" />
        <Text style={styles.nombrePaciente}>
          {[pacienteSeleccionado.nombre, pacienteSeleccionado.apellido].filter(Boolean).join(' ')}
        </Text>
        <Text style={styles.infoPaciente}>Sesiones: {sesiones.length}</Text>
      </View>

      <View style={styles.sesionesContainer}>
        <Text style={styles.seccionTitulo}>Sesiones</Text>
        {sesiones.length === 0 ? (
          <Text style={styles.sinSesiones}>No hay sesiones para este paciente.</Text>
        ) : (
          <ScrollView style={{ maxHeight: esWeb ? 400 : undefined }}>
            {sesiones.map(sesion => (
              <View key={sesion.id} style={styles.sesionItem}>
                <Text style={styles.fechaSesion}>
                  {moment(sesion.fecha.toDate()).format('D [de] MMMM [de] YYYY')}
                </Text>
                <Text numberOfLines={2} style={styles.anotaciones}>{sesion.anotacionesPrivadas}</Text>
                <Text style={styles.ejercicios}>
                  Ejercicios: {sesion.ejerciciosRealizados.join(', ')}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
  <Ionicons
    name={sesion.pagado ? 'checkmark-circle-outline' : 'close-circle-outline'}
    size={18}
    color={sesion.pagado ? '#2ecc71' : '#e74c3c'}
    style={{ marginRight: 6 }}
  />
  <Text style={{ color: '#d4f0f0', fontWeight: 'bold' }}>
    {sesion.pagado ? 'Pagado' : 'Pendiente'}
  </Text>
</View>

                {sesion.documentosAdjuntos && sesion.documentosAdjuntos.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ color: '#d4f0f0', fontWeight: 'bold', marginBottom: 5 }}>
                      Archivos adjuntos:
                    </Text>
                    {sesion.documentosAdjuntos.map((url, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text numberOfLines={1} style={{ flex: 1, color: '#d4f0f0' }}>
                          {url.split('/').pop()}
                        </Text>
                        <TouchableOpacity
                          onPress={() => Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url)}
                          style={{ marginLeft: 10 }}
                        >
                          <Ionicons name="download-outline" size={18} color="#d4f0f0" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.botonesSesion}>
                  <TouchableOpacity onPress={() => {
                    setSesionEditando(sesion);
                    setAnotaciones(sesion.anotacionesPrivadas);
                    setEjercicios(sesion.ejerciciosRealizados.join(', '));
                    setFechaSesion(sesion.fecha.toDate());
                    setDocumentosAdjuntos(sesion.documentosAdjuntos || []);
                    setPagado(sesion.pagado ?? false);
                    setModalVisible(true);
                  }} style={styles.botonEditar}>
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <Text style={styles.textoBoton}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleBorrarSesion(sesion.id)} style={styles.botonBorrar}>
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                    <Text style={styles.textoBoton}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
{pacienteSeleccionado && (
  <TouchableOpacity
    style={[
      styles.fab,
      esWeb && { bottom: 30, right: 30 }  // Ajuste para escritorio si deseas moverlo un poco
    ]}
    onPress={() => {
      setSesionEditando(null);
      setAnotaciones('');
      setEjercicios('');
      setFechaSesion(null);
      setDocumentosAdjuntos([]);
      setModalVisible(true);
    }}
  >
    <Ionicons name="add" size={28} color="#fff" />
  </TouchableOpacity>
)}

    </View>
  ) : (
    <View style={styles.sinSeleccion}>
      <Text style={{ fontSize: 18, color: '#888' }}>
        Selecciona un paciente para ver sus sesiones
      </Text>
    </View>
  )
);


const subirArchivoSesion = async () => {
  if (Platform.OS === 'web') {
    // Crear un input invisible
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !pacienteSeleccionado?.id) return;

      const formData = new FormData();
      formData.append('pacienteId', pacienteSeleccionado.id);
      formData.append('archivo', file); // En web se pasa el objeto File directamente

      try {
        const response = await fetch('http://localhost/neurogestion-backend/subir_archivo_sesion.php', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.url) {
          setDocumentosAdjuntos(prev => [...prev, data.url]);
          alert('Archivo subido correctamente');
        } else {
          alert('Error al subir archivo');
        }
      } catch (error) {
        console.error('Error al subir archivo:', error);
        alert('Error al subir archivo');
      }
    };

    input.click(); 
  } else {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      const formData = new FormData();
      formData.append('pacienteId', pacienteSeleccionado.id);
      formData.append('archivo', {
        uri: file.uri,
        type: file.mimeType || 'application/octet-stream',
        name: file.name,
      } as any);

      try {
        const response = await fetch('http://localhost/neurogestion-backend/subir_archivo_sesion.php', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const data = await response.json();
        if (data.url) {
          setDocumentosAdjuntos(prev => [...prev, data.url]);
          alert('Archivo subido correctamente');
        } else {
          alert('Error al subir archivo');
        }
      } catch (error) {
        console.error('Error al subir archivo:', error);
        alert('Error al subir archivo');
      }
    }
  }
};



const eliminarDocumentoLocal = (url) => {
  setDocumentosAdjuntos(prev => prev.filter(doc => doc !== url));
};


const handleAñadirSesion = async () => {
  if (!anotaciones || !ejercicios || !fechaSesion) {
    alert('Por favor, complete los campos');
    return;
  }
  try {
    await addDoc(collection(db, 'sesiones'), {
      pacienteId: pacienteSeleccionado.id,
      anotacionesPrivadas: anotaciones,
      ejerciciosRealizados: [ejercicios],
      fecha: fechaSesion,
      documentosAdjuntos: documentosAdjuntos,
      pagado: pagado, 
      usuarioId: usuario?.id || '', 
    });
    alert('Sesión añadida');
    setModalVisible(false);
    cargarSesiones(pacienteSeleccionado.id);
  } catch (error) {
    console.error('Error al añadir sesión', error);
    alert('Error al añadir sesión');
  }
};


  const handleEditarSesion = async () => {
  try {
    await updateDoc(doc(db, 'sesiones', sesionEditando.id), {
      anotacionesPrivadas: anotaciones,
      ejerciciosRealizados: [ejercicios],
      fecha: fechaSesion,
      documentosAdjuntos: documentosAdjuntos,
      pagado: pagado,
    });
    alert('Sesión actualizada');
    setModalVisible(false);
    cargarSesiones(pacienteSeleccionado.id);
  } catch (error) {
    console.error('Error al editar sesión', error);
    alert('Error al editar sesión');
  }
};


  const handleBorrarSesion = async (id) => {
    try {
      await deleteDoc(doc(db, 'sesiones', id));
      alert('Sesión eliminada');
      cargarSesiones(pacienteSeleccionado.id);
    } catch (error) {
      console.error('Error al borrar sesión', error);
      alert('Error al borrar sesión');
    }
  };

  const pacientesFiltrados = pacientes.filter(p =>
    (p.nombre + ' ' + p.apellido).toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
          <Text style={styles.navText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Sesiones</Text>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Perfil')}>
                  <Text style={styles.navText}>{usuario?.nombre || 'Perfil'}</Text>
                  <Ionicons name="person-circle-outline" size={28} color="#fff" />
                </TouchableOpacity>
      </View>
        <ImageBackground
          source={require('../assets/imagenes/imagenFondo.jpg')}
          style={styles.fondoImagen}
          resizeMode="cover"
        />

{esWeb ? (
  // 💻 Web: columnas
  <View style={styles.content}>
    <View style={styles.colIzquierda}>
      {renderBuscadorYLista()}
    </View>
    <View style={styles.colDerecha}>
      {renderDetalleYSesiones()}
    </View>
  </View>
) : (
  // 📱 Móvil: diseño vertical
  <ScrollView contentContainerStyle={{ padding: 10 }}>
    {renderBuscadorYLista()}
    {renderDetalleYSesiones()}
  </ScrollView>
)}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{sesionEditando ? 'Editar Sesión' : 'Añadir Sesión'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Anotaciones privadas"
              multiline
              value={anotaciones}
              onChangeText={setAnotaciones}
            />

            <TextInput
              style={styles.input}
              placeholder="Ejercicios realizados (separados por coma)"
              value={ejercicios}
              onChangeText={setEjercicios}
            />

            {esWeb ? (
  <input
    type="datetime-local"
    value={fechaSesion ? moment(fechaSesion).format('YYYY-MM-DDTHH:mm') : ''}
    onChange={(e) => {
      const inputValue = e.target.value;
      const parsedDate = new Date(inputValue);
      if (inputValue && !isNaN(parsedDate.getTime())) {
        setFechaSesion(parsedDate);
      } else {
        setFechaSesion(null);
      }
    }}
    style={styles.inputWeb} // Define estilo para input web
  />
) : (
  <>
    <TouchableOpacity style={styles.fechaInput} onPress={() => setMostrarPickerFecha(true)}>
      <Text style={styles.fechaTexto}>
        {fechaSesion ? moment(fechaSesion).format('D/M/YYYY, HH:mm') : 'Seleccionar fecha de sesión'}
      </Text>
    </TouchableOpacity>
    {mostrarPickerFecha && (
      <DateTimePicker
        value={fechaSesion || new Date()}
        mode="datetime"
        display="default"
        onChange={(event, selectedDate) => {
          setMostrarPickerFecha(false);
          if (selectedDate) setFechaSesion(selectedDate);
        }}
      />
    )}
  </>
)}
<View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
  <Text style={{ fontSize: 16, color: '#333', marginRight: 10 }}>Pagado:</Text>
  <Switch
    value={pagado}
    onValueChange={setPagado}
    trackColor={{ false: '#ccc', true: '#2b7a78' }}
    thumbColor={pagado ? '#fff' : '#fff'}
  />
</View>


            <TouchableOpacity style={styles.iconButton} onPress={subirArchivoSesion}>
              <Ionicons name="attach" size={24} color="#fff" />
              <Text style={styles.iconButtonText}>Adjuntar documento</Text>
            </TouchableOpacity>

            {documentosAdjuntos.length > 0 && (
  <View style={{ marginTop: 10 }}>
    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Archivos adjuntos:</Text>
    {documentosAdjuntos.map((url, index) => (
      <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text numberOfLines={1} style={{ flex: 1, color: '#333' }}>
          {url.split('/').pop()}
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS === 'web') {
              window.open(url, '_blank');
            } else {
              Linking.openURL(url);
            }
          }}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="download-outline" size={20} color="#2b7a78" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => eliminarDocumentoLocal(url)}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    ))}
  </View>
)}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <TouchableOpacity
                onPress={sesionEditando ? handleEditarSesion : handleAñadirSesion}
                style={[styles.button, { flex: 1, marginRight: 5 }]}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.button, { flex: 1, marginLeft: 5, backgroundColor: '#999' }]}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', position: 'relative' },
  navbar: {
    height: 60,
    backgroundColor: '#2b7a78',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
  },
  navTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  navItem: { flexDirection: 'row', alignItems: 'center' },
  navText: { color: '#fff', fontSize: 16, marginLeft: 6 },

  fondoImagen: { flex: 1, width: '100%', height: '100%', position: 'absolute', top: 60 },

  content: { flex: 1, flexDirection: 'row' },
  colIzquierda: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 10,
    borderRightWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pacienteItem: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  pacienteSeleccionado: {
    backgroundColor: '#d0f0ef',
  },
  pacienteNombre: { fontSize: 18, fontWeight: '600', color: '#333' },
  badgeSesiones: {
    backgroundColor: '#2b7a78',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontWeight: 'bold' },

  colDerecha: {
    flex: 2,
    padding: 15,
    backgroundColor: '#fff',
  },
  detallePaciente: {
    alignItems: 'center',
    marginBottom: 15,
  },
  nombrePaciente: { fontSize: 24, fontWeight: 'bold', color: '#2b7a78', marginTop: 8 },
  infoPaciente: { fontSize: 16, color: '#555' },

  sesionesContainer: { marginTop: 10 },
  seccionTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#2b7a78' },
  sinSesiones: { fontSize: 16, color: '#888', fontStyle: 'italic' },
  sesionItem: {
    backgroundColor: '#2b7a78',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  fechaSesion: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  anotaciones: { color: '#d4f0f0', marginTop: 5 },
  ejercicios: { color: '#d4f0f0', marginTop: 5, fontStyle: 'italic' },

  botonesSesion: { flexDirection: 'row', marginTop: 10, justifyContent: 'flex-end' },
  botonEditar: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  botonBorrar: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  textoBoton: { color: '#fff', marginLeft: 5, fontWeight: 'bold' },
fab: {
  position: 'absolute',
  bottom: 25,
  right: 25,
  backgroundColor: '#2b7a78',
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 5,
  zIndex: 10, // opcional para que quede encima
},


  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
modalContent: {
  width: '90%',
  maxWidth: 500,
  backgroundColor: '#fff',
  padding: 25,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 8,
},

  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#2b7a78', textAlign: 'center' },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
button: {
  backgroundColor: '#2b7a78',
  borderRadius: 8,
  padding: 14,
  alignItems: 'center',
  marginTop: 10,
},

buttonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
  textTransform: 'uppercase',
},

  iconButton: {
    backgroundColor: '#2b7a78',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  iconButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '600',
  },
  sinSeleccion: {
  backgroundColor: '#f0f0f0',
  borderWidth: 1,
  borderColor: '#ccc',      
  padding: 15,
  marginBottom: 10,
  borderRadius: 8,
  shadowColor: '#aaa',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 2,
},
inputWeb: {
  width: '100%',
  padding: 10,
  borderRadius: 5,
  borderWidth: 1,
  borderColor: '#ccc',
  fontSize: 16,
},
fechaInput: {
  padding: 10,
  borderRadius: 5,
  borderWidth: 1,
  borderColor: '#ccc',
  justifyContent: 'center',
},
fechaTexto: {
  fontSize: 16,
  color: '#333',
},
});

export default Sesiones;
