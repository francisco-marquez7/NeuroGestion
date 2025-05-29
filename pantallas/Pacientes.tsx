import React, { useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Animated,
  Button,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Alert
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { Checkbox } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { Timestamp } from 'firebase/firestore'; 
import { obtenerPacientes, eliminarPaciente, agregarPaciente,actualizarPaciente } from '../firebase/firestoreService'; 

import { useWindowDimensions } from 'react-native';
import { useUsuario } from '../context/UsuarioContext';
import { Video, ResizeMode } from 'expo-av';


export default function Pacientes({ navigation }: any) {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [alturaAnimada] = useState(new Animated.Value(180));
  const { width } = useWindowDimensions();
  const esWeb = Platform.OS === 'web' && width > 800;
  const { usuario } = useUsuario();
const [modalEditarVisible, setModalEditarVisible] = useState(false);
const [pacienteEditar, setPacienteEditar] = useState(null);
const [filtroBusqueda, setFiltroBusqueda] = useState('');
const [filtroFiltroUnico, setFiltroFiltroUnico] = useState('todos');


const estilosDinamicos = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 15,
    elevation: 6,
    padding: 20,
    minWidth: 300,
    minHeight: 220,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    flexBasis: esWeb ? '45%' : '90%',
    maxWidth: esWeb ? 500 : '100%',
  },
});


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

  const confirmarEliminar = (id: string) => {
  if (Platform.OS === 'web') {
    // Confirm nativo de navegador
    if (window.confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      eliminarPacienteConfirmado(id);
    }
  } else {
    // Para iOS y Android
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este paciente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminarPacienteConfirmado(id) },
      ],
      { cancelable: true }
    );
  }
};


const eliminarPacienteConfirmado = async (id: string) => {
  try {
    await eliminarPaciente(id);
    const datosActualizados = await obtenerPacientes();
    setPacientes(datosActualizados);
  } catch (error) {
    alert('Error al eliminar el paciente');
  }
};


 const manejarEditar = (paciente) => {
  abrirModalEditar(paciente);
};

const refrescarPacientes = async () => {
  const datos = await obtenerPacientes();
  setPacientes(datos);
};

  const calcularEdad = (fechaNacimiento: any) => {
    const hoy = new Date();
    const nacimiento = typeof fechaNacimiento.toDate === 'function'
      ? fechaNacimiento.toDate()
      : new Date(fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };
  // Dentro del componente Pacientes
const [modalAltaVisible, setModalAltaVisible] = useState(false);
const [formData, setFormData] = useState({
  nombre: '',
  apellidos: '',
  fechaNacimiento: '',
  dni: '',
  email: '',
  telefono: '',
  beca: false,
  tipoBeca: '',
  pagado: false,
  metodoPago: 'Efectivo',
  recibo: false,
  estado: 'Activo',
  diagnostico: '',
});
const [showDatePicker, setShowDatePicker] = useState(false);

const handleChange = (field: string, value: any) => {
  setFormData({ ...formData, [field]: value });
};

const abrirModalAlta = () => setModalAltaVisible(true);
const cerrarModalAlta = () => {
  setModalAltaVisible(false);
  // Limpiar formulario si quieres
  setFormData({
    nombre: '',
    apellidos: '',
    fechaNacimiento: '',
    dni: '',
    email: '',
    telefono: '',
    beca: false,
    tipoBeca: '',
    pagado: false,
    metodoPago: 'Efectivo',
    recibo: false,
    estado: 'Activo',
    diagnostico: '',
  });
};

const guardarPaciente = async () => {
  try {
    const pacienteFormateado = {
      ...formData,
      fechaNacimiento: Timestamp.fromDate(new Date(formData.fechaNacimiento)),
    };
    await agregarPaciente(pacienteFormateado);
    cerrarModalAlta();
    await refrescarPacientes(); // Aquí refrescas la lista
    // Resetear formulario si quieres
    setFormData({
      nombre: '',
      apellidos: '',
      fechaNacimiento: '',
      dni: '',
      email: '',
      telefono: '',
      beca: false,
      tipoBeca: '',
      pagado: false,
      metodoPago: 'Efectivo',
      recibo: false,
      estado: 'Activo',
      diagnostico: '',
    });
  } catch (error) {
    alert('Error al guardar paciente');
  }
};


const renderPaciente = ({ item }: any) => {
  const expandido = expandidoId === item.id;
  const colorFondo = item.estado === 'Activo' ? '#e6f7ef' : '#fdecea';
  const colorTextoEstado = item.estado === 'Activo' ? '#27ae60' : '#c0392b';
  const edad = calcularEdad(item.fechaNacimiento);

  return (
    <View style={[estilosDinamicos.card, expandido && styles.cardExpandido, { backgroundColor: colorFondo }]}>
      <TouchableOpacity onPress={() => manejarExpandir(item.id)}>
        <View style={styles.headerCard}>
          <Ionicons name="person-circle-outline" size={60} color="#2b7a78" />
          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={styles.nombre}>{item.nombre} {item.apellidos}</Text>
            <Text style={[styles.estado, { color: colorTextoEstado }]}>{item.estado}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.labelCard}>Edad:</Text>
          <Text style={styles.infoCard}>{edad} años</Text>
          <Text style={styles.labelCard}>DNI:</Text>
          <Text style={styles.infoCard}>{item.dni}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.labelCard}>Email:</Text>
          <Text style={styles.infoCard}>{item.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.labelCard}>Teléfono:</Text>
          <Text style={styles.infoCard}>{item.telefono}</Text>
        </View>

        {expandido && (
          <>
            <TouchableOpacity style={styles.botonCerrar} onPress={() => manejarExpandir(item.id)}>
              <Ionicons name="close-circle" size={28} color="#e74c3c" />
            </TouchableOpacity>

            <View style={styles.infoRow}>
              <Text style={styles.labelCard}>Diagnóstico:</Text>
              <Text style={styles.infoCard}>{item.diagnostico || '-'}</Text>
            </View>

            <View style={styles.iconosAcciones}>
              <TouchableOpacity onPress={() => manejarEditar(item)} style={styles.iconoAccion}>
                <Ionicons name="create-outline" size={28} color="#2b7a78" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmarEliminar(item.id)} style={styles.iconoAccionEliminar}>
                <Ionicons name="trash-outline" size={28} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};


  const [formEditarData, setFormEditarData] = useState({
  nombre: '',
  apellidos: '',
  fechaNacimiento: '',
  dni: '',
  email: '',
  telefono: '',
  beca: false,
  tipoBeca: '',
  pagado: false,
  metodoPago: 'Efectivo',
  recibo: false,
  estado: 'Activo',
  diagnostico: '',
});
const [showDatePickerEditar, setShowDatePickerEditar] = useState(false);
const abrirModalEditar = (paciente) => {
  setPacienteEditar(paciente);
  setFormEditarData({
    nombre: paciente.nombre || '',
    apellidos: paciente.apellidos || '',
    fechaNacimiento: paciente.fechaNacimiento?.toDate ? paciente.fechaNacimiento.toDate().toISOString().split('T')[0] : paciente.fechaNacimiento || '',
    dni: paciente.dni || '',
    email: paciente.email || '',
    telefono: paciente.telefono || '',
    beca: paciente.beca || false,
    tipoBeca: paciente.tipoBeca || '',
    pagado: paciente.pagado || false,
    metodoPago: paciente.metodoPago || 'Efectivo',
    recibo: paciente.recibo || false,
    estado: paciente.estado || 'Activo',
    diagnostico: paciente.diagnostico || '',
  });
  setModalEditarVisible(true);
};

const cerrarModalEditar = () => {
  setModalEditarVisible(false);
  setPacienteEditar(null);
  setShowDatePickerEditar(false);
};

const handleChangeEditar = (field: string, value: any) => {
  setFormEditarData({ ...formEditarData, [field]: value });
};

const guardarPacienteEditar = async () => {
  try {
    const pacienteFormateado = {
      ...formEditarData,
      fechaNacimiento: new Date(formEditarData.fechaNacimiento),
    };
    await actualizarPaciente(pacienteEditar.id, pacienteFormateado);
    cerrarModalEditar();
    await refrescarPacientes();
  } catch (error) {
    alert('Error al guardar paciente');
  }
};
const aplicarFiltrosYOrden = () => {
  let lista = [...pacientes];

  // Filtrar por búsqueda (nombre + apellidos)
  if (filtroBusqueda.trim() !== '') {
    const busqLower = filtroBusqueda.trim().toLowerCase();
    lista = lista.filter((p) => 
      `${p.nombre} ${p.apellidos}`.toLowerCase().includes(busqLower)
    );
  }

  // Filtrar por estado
  if (filtroFiltroUnico === 'activo') {
    lista = lista.filter(p => p.estado === 'Activo');
  } else if (filtroFiltroUnico === 'inactivo') {
    lista = lista.filter(p => p.estado === 'Inactivo');
  }

  // Ordenar según filtroFiltroUnico
  if (filtroFiltroUnico === 'nombre_asc') {
    lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } else if (filtroFiltroUnico === 'nombre_desc') {
    lista.sort((a, b) => b.nombre.localeCompare(a.nombre));
  } else if (filtroFiltroUnico === 'edad_asc') {
    lista.sort((a, b) => calcularEdad(a.fechaNacimiento) - calcularEdad(b.fechaNacimiento));
  } else if (filtroFiltroUnico === 'edad_desc') {
    lista.sort((a, b) => calcularEdad(b.fechaNacimiento) - calcularEdad(a.fechaNacimiento));
  }

  return lista;
};

const listaFiltrada = useMemo(() => aplicarFiltrosYOrden(), [pacientes, filtroBusqueda, filtroFiltroUnico]);


  return (
    <View style={styles.contenedor}>
      <View style={styles.navbar}>
              <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                <Text style={styles.navText}>Volver</Text>
              </TouchableOpacity>
              <Text style={styles.navTitle}>Pacientes</Text>
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

      <View style={styles.contenido}>
          <View style={styles.barraFiltros}>
  <TextInput
    placeholder="Buscar por nombre..."
    style={styles.inputBusqueda}
    value={filtroBusqueda}
    onChangeText={setFiltroBusqueda}
  />
  <Picker
    selectedValue={filtroFiltroUnico}
    onValueChange={setFiltroFiltroUnico}
    style={styles.pickerFiltro}
  >
    <Picker.Item label="Todos" value="todos" />
    <Picker.Item label="Nombre Ascendente" value="nombre_asc" />
    <Picker.Item label="Nombre Descendente" value="nombre_desc" />
    <Picker.Item label="Activo" value="activo" />
    <Picker.Item label="Inactivo" value="inactivo" />
    <Picker.Item label="Edad Ascendente" value="edad_asc" />
    <Picker.Item label="Edad Descendente" value="edad_desc" />
  </Picker>
</View>


<FlatList
  data={listaFiltrada}
  renderItem={renderPaciente}
  keyExtractor={(item, index) => item.id || index.toString()}
  contentContainerStyle={[styles.lista, esWeb && { paddingHorizontal: 40 }]}
  showsVerticalScrollIndicator={false}
  numColumns={esWeb ? 3 : 1}
  columnWrapperStyle={esWeb ? { justifyContent: 'space-between' } : undefined}
  key={esWeb ? 'web' : 'mobile'}
/>

  <TouchableOpacity
  style={{
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2b7a78',
    padding: 15,
    borderRadius: 30,
  }}
  onPress={abrirModalAlta} 
>
  <Ionicons name="add" size={24} color="#fff" />
</TouchableOpacity>
      </View>
<Modal visible={modalAltaVisible} animationType="slide" transparent={true} onRequestClose={cerrarModalAlta}>
        <View style={styles.modalBackground}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.modalHeader}>
                <Text style={styles.titulo}>Alta de Paciente</Text>
                <TouchableOpacity onPress={cerrarModalAlta}>
                  <Ionicons name="close-circle-outline" size={28} color="#2b7a78" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={formData.nombre}
                onChangeText={(t) => handleChange('nombre', t)}
              />
              <TextInput
                style={styles.input}
                placeholder="Apellidos"
                value={formData.apellidos}
                onChangeText={(t) => handleChange('apellidos', t)}
              />

              <Text style={styles.label}>Fecha de nacimiento</Text>

              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                  style={{
                    width: '100%',
                    marginBottom: 12,
                    padding: 8,
                    borderRadius: 5,
                    border: '1px solid #ccc',
                    fontSize: 14,
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                    <Text style={{ color: formData.fechaNacimiento ? '#000' : '#aaa' }}>
                      {formData.fechaNacimiento || 'Seleccionar fecha'}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={formData.fechaNacimiento ? new Date(formData.fechaNacimiento) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          const fecha = selectedDate.toISOString().split('T')[0];
                          handleChange('fechaNacimiento', fecha);
                        }
                      }}
                    />
                  )}
                </>
              )}

              <TextInput
                style={styles.input}
                placeholder="DNI"
                value={formData.dni}
                onChangeText={(t) => handleChange('dni', t)}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.email}
                onChangeText={(t) => handleChange('email', t)}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={formData.telefono}
                onChangeText={(t) => handleChange('telefono', t)}
                keyboardType="phone-pad"
              />

              <View style={styles.checkboxRow}>
                <Checkbox
                  status={formData.beca ? 'checked' : 'unchecked'}
                  onPress={() => handleChange('beca', !formData.beca)}
                />
                <Text style={styles.checkboxLabel}>Beca</Text>
              </View>
              {formData.beca && (
                <TextInput
                  style={styles.input}
                  placeholder="Tipo de beca"
                  value={formData.tipoBeca}
                  onChangeText={(t) => handleChange('tipoBeca', t)}
                />
              )}

              <View style={styles.checkboxRow}>
                <Checkbox
                  status={formData.pagado ? 'checked' : 'unchecked'}
                  onPress={() => handleChange('pagado', !formData.pagado)}
                />
                <Text style={styles.checkboxLabel}>Pagado</Text>
              </View>
              {formData.pagado && (
                <>
                  <Text style={styles.label}>Método de pago</Text>
                  <Picker
                    selectedValue={formData.metodoPago}
                    onValueChange={(value) => handleChange('metodoPago', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Efectivo" value="Efectivo" />
                    <Picker.Item label="Bizum" value="Bizum" />
                    <Picker.Item label="Transferencia" value="Transferencia" />
                    <Picker.Item label="Tarjeta" value="Tarjeta" />
                  </Picker>

                  <View style={styles.checkboxRow}>
                    <Checkbox
                      status={formData.recibo ? 'checked' : 'unchecked'}
                      onPress={() => handleChange('recibo', !formData.recibo)}
                    />
                    <Text style={styles.checkboxLabel}>Recibo</Text>
                  </View>
                </>
              )}

              <Text style={styles.label}>Estado</Text>
              <Picker
                selectedValue={formData.estado}
                onValueChange={(itemValue) => handleChange('estado', itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Activo" value="Activo" />
                <Picker.Item label="Inactivo" value="Inactivo" />
              </Picker>

              <TextInput
                style={styles.input}
                placeholder="Diagnóstico"
                value={formData.diagnostico}
                onChangeText={(t) => handleChange('diagnostico', t)}
              />

              <View style={styles.botonera}>
                <Button title="Guardar" onPress={guardarPaciente} color="#2b7a78" />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      <Modal visible={modalEditarVisible} animationType="slide" transparent={true} onRequestClose={cerrarModalEditar}>
  <View style={styles.modalBackground}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.modalHeader}>
          <Text style={styles.titulo}>Editar Paciente</Text>
          <TouchableOpacity onPress={cerrarModalEditar}>
            <Ionicons name="close-circle-outline" size={28} color="#2b7a78" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={formEditarData.nombre}
          onChangeText={(t) => handleChangeEditar('nombre', t)}
        />
        <TextInput
          style={styles.input}
          placeholder="Apellidos"
          value={formEditarData.apellidos}
          onChangeText={(t) => handleChangeEditar('apellidos', t)}
        />

        <Text style={styles.label}>Fecha de nacimiento</Text>

        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={formEditarData.fechaNacimiento}
            onChange={(e) => handleChangeEditar('fechaNacimiento', e.target.value)}
            style={{
              width: '100%',
              marginBottom: 12,
              padding: 8,
              borderRadius: 5,
              border: '1px solid #ccc',
              fontSize: 14,
            }}
          />
        ) : (
          <>
            <TouchableOpacity onPress={() => setShowDatePickerEditar(true)} style={styles.input}>
              <Text style={{ color: formEditarData.fechaNacimiento ? '#000' : '#aaa' }}>
                {formEditarData.fechaNacimiento || 'Seleccionar fecha'}
              </Text>
            </TouchableOpacity>

            {showDatePickerEditar && (
              <DateTimePicker
                value={formEditarData.fechaNacimiento ? new Date(formEditarData.fechaNacimiento) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePickerEditar(false);
                  if (selectedDate) {
                    const fecha = selectedDate.toISOString().split('T')[0];
                    handleChangeEditar('fechaNacimiento', fecha);
                  }
                }}
              />
            )}
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="DNI"
          value={formEditarData.dni}
          onChangeText={(t) => handleChangeEditar('dni', t)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formEditarData.email}
          onChangeText={(t) => handleChangeEditar('email', t)}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          value={formEditarData.telefono}
          onChangeText={(t) => handleChangeEditar('telefono', t)}
          keyboardType="phone-pad"
        />

        <View style={styles.checkboxRow}>
          <Checkbox
            status={formEditarData.beca ? 'checked' : 'unchecked'}
            onPress={() => handleChangeEditar('beca', !formEditarData.beca)}
          />
          <Text style={styles.checkboxLabel}>Beca</Text>
        </View>
        {formEditarData.beca && (
          <TextInput
            style={styles.input}
            placeholder="Tipo de beca"
            value={formEditarData.tipoBeca}
            onChangeText={(t) => handleChangeEditar('tipoBeca', t)}
          />
        )}

        <View style={styles.checkboxRow}>
          <Checkbox
            status={formEditarData.pagado ? 'checked' : 'unchecked'}
            onPress={() => handleChangeEditar('pagado', !formEditarData.pagado)}
          />
          <Text style={styles.checkboxLabel}>Pagado</Text>
        </View>
        {formEditarData.pagado && (
          <>
            <Text style={styles.label}>Método de pago</Text>
            <Picker
              selectedValue={formEditarData.metodoPago}
              onValueChange={(value) => handleChangeEditar('metodoPago', value)}
              style={styles.picker}
            >
              <Picker.Item label="Efectivo" value="Efectivo" />
              <Picker.Item label="Bizum" value="Bizum" />
              <Picker.Item label="Transferencia" value="Transferencia" />
              <Picker.Item label="Tarjeta" value="Tarjeta" />
            </Picker>

            <View style={styles.checkboxRow}>
              <Checkbox
                status={formEditarData.recibo ? 'checked' : 'unchecked'}
                onPress={() => handleChangeEditar('recibo', !formEditarData.recibo)}
              />
              <Text style={styles.checkboxLabel}>Recibo</Text>
            </View>
          </>
        )}

        <Text style={styles.label}>Estado</Text>
        <Picker
          selectedValue={formEditarData.estado}
          onValueChange={(itemValue) => handleChangeEditar('estado', itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Activo" value="Activo" />
          <Picker.Item label="Inactivo" value="Inactivo" />
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="Diagnóstico"
          value={formEditarData.diagnostico}
          onChangeText={(t) => handleChangeEditar('diagnostico', t)}
        />

          <View style={styles.botonera}>
            <Button title="Guardar Cambios" onPress={guardarPacienteEditar} color="#2b7a78" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  </Modal>
</View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1, position: 'relative', backgroundColor: 'transparent'
  },
fondoImagen: {
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  zIndex: -1,
},
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

  contenido: {
  flex: 1,
  width: '100%',
  paddingTop: 20,
  zIndex: 1,
},

  lista: {
    paddingVertical: 20,
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
  icono: {
    marginHorizontal: 8,
  },
modalBackground: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  backgroundColor: '#fff',
  borderRadius: 20,
  width: '90%',
  maxHeight: '90%',
  padding: 20,
},
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '90%',
    padding: 20,
  },
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 15,
},
titulo: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#2b7a78',
},
input: {
  borderBottomWidth: 1,
  borderColor: '#ccc',
  marginBottom: 12,
  paddingVertical: 6,
  paddingHorizontal: 4,
},
label: {
  fontWeight: 'bold',
  marginTop: 10,
  color: '#333',
},
picker: {
  backgroundColor: Platform.OS === 'android' ? '#f0f0f0' : undefined,
  marginBottom: 15,
},
checkboxRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
checkboxLabel: {
  marginLeft: 6,
},
botonera: {
  marginTop: 20,
  gap: 10,
},
barraFiltros: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  paddingHorizontal: 20,
  marginBottom: 15,
  flexWrap: 'wrap',
  gap: 10,
},

inputBusqueda: {
  flexGrow: 1,
  minWidth: 200,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  fontSize: 16,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
},
pickerFiltro: {
  width: 150,
  backgroundColor: '#f0f0f0',
  borderRadius: 8,
  height: 40,
},

card: {
  backgroundColor: '#fff',
  margin: 10,
  borderRadius: 15,
  elevation: 4,
  padding: 20,
  minWidth: 280,
  maxWidth: 500,
  alignSelf: 'flex-start',
  flexBasis: '30%',
},

cardExpandido: {
},
headerCard: {
  flexDirection: 'row',
  alignItems: 'center',
},
nombre: {
  fontSize: 20,
  fontWeight: '700',
  color: '#2b7a78',
},
estado: {
  fontWeight: '600',
  marginTop: 2,
},
infoRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 10,
  gap: 12,
},
labelCard: {
  fontWeight: '700',
  color: '#34495e',
  marginRight: 4,
},
infoCard: {
  fontWeight: '400',
  color: '#555',
  marginRight: 12,
},
botonAccion: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#2b7a78',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
},
textoBotonAccion: {
  color: '#fff',
  marginLeft: 6,
  fontWeight: '700',
},
botonAccionEliminar: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#e74c3c',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
},
textoBotonEliminar: {
  color: '#fff',
  marginLeft: 6,
  fontWeight: '700',
},

botonAgregar: {
  position: 'absolute',
  bottom: 25,
  right: 25,
  backgroundColor: '#2b7a78',
  borderRadius: 40,
  padding: 18,
  elevation: 8,
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.3,
  shadowRadius: 6,
},
botonCerrar: {
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 10,
},
iconosAcciones: {
  flexDirection: 'row',
  marginTop: 18,
  gap: 20,
  justifyContent: 'flex-start',
},
iconoAccion: {
  padding: 4,
},
iconoAccionEliminar: {
  padding: 4,
},

});

