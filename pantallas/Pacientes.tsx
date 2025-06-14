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


export default function Pacientes({ navigation }: any) {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const { width } = useWindowDimensions();
  const esWeb = Platform.OS === 'web' && width > 800;
  const { usuario } = useUsuario();
const [modalEditarVisible, setModalEditarVisible] = useState(false);
const [pacienteEditar, setPacienteEditar] = useState(null);
const [filtroBusqueda, setFiltroBusqueda] = useState('');
const [filtroFiltroUnico, setFiltroFiltroUnico] = useState('todos');
const [pacienteDetalle, setPacienteDetalle] = useState(null);
const [modalDetalleVisible, setModalDetalleVisible] = useState(false);


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

  const confirmarEliminar = (id: string) => {
  if (Platform.OS === 'web') {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      eliminarPacienteConfirmado(id);
    }
  } else {
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

const abrirModalDetalle = (paciente) => {
  setPacienteDetalle(paciente);
  setModalDetalleVisible(true);
};

const cerrarModalDetalle = () => {
  setPacienteDetalle(null);
  setModalDetalleVisible(false);
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
  cerrarModalDetalle(); 
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
    await refrescarPacientes();
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
  
  const colorFondo = item.estado === 'Activo' ? '#e6f7ef' : '#fdecea';
  const colorTextoEstado = item.estado === 'Activo' ? '#27ae60' : '#c0392b';
  const edad = calcularEdad(item.fechaNacimiento);

  return (
    <View style={[
  estilosDinamicos.card,
  { backgroundColor: colorFondo }
]}>
      <TouchableOpacity onPress={() => abrirModalDetalle(item)}>
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

            <TouchableOpacity style={styles.botonCerrar} onPress={() => abrirModalDetalle(item.id)}>
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

  if (filtroBusqueda.trim() !== '') {
  const busqLower = filtroBusqueda.trim().toLowerCase();
  lista = lista.filter((p) =>
    `${p.nombre} ${p.apellidos}`.toLowerCase().includes(busqLower) ||
    p.nombre.toLowerCase().includes(busqLower) ||
    p.apellidos.toLowerCase().includes(busqLower)
  );
}

  if (filtroFiltroUnico === 'activo') {
    lista = lista.filter(p => p.estado === 'Activo');
  } else if (filtroFiltroUnico === 'inactivo') {
    lista = lista.filter(p => p.estado === 'Inactivo');
  }

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

const PacienteCard = ({ item, onPress }: any) => {
  const edad = calcularEdad(item.fechaNacimiento);
  const colorFondo = item.estado === 'Activo' ? '#e6f7ef' : '#fdecea';
  const colorTextoEstado = item.estado === 'Activo' ? '#27ae60' : '#c0392b';

  return (
    <View style={[estilosDinamicos.card, { backgroundColor: colorFondo }]}>
      <TouchableOpacity onPress={onPress}>
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
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.labelCard}>Diagnóstico:</Text>
          <Text style={styles.infoCard}>{item.diagnostico || '-'}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};



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
{Platform.OS === 'web' ? (
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


<View
  style={[
    styles.lista,
    esWeb && {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      paddingHorizontal: 40,
      gap: 20,
    },
  ]}
>
 {listaFiltrada.map((item) => (
  <View key={item.id} style={{ width: esWeb ? '30%' : '100%', maxWidth: 400 }}>
    <PacienteCard
  item={item}
  onEditar={manejarEditar}
  onEliminar={confirmarEliminar}
  onPress={() => abrirModalDetalle(item)}
/>

  </View>
))}
</View>

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
) : (
  <ScrollView style={styles.contenido} contentContainerStyle={{ paddingBottom: 100 }}>
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
  </ScrollView>
)}
<Modal visible={modalAltaVisible} animationType="slide" transparent={true} onRequestClose={cerrarModalAlta}>
  <View style={styles.modalBackground}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
      <ScrollView
  contentContainerStyle={{ paddingBottom: 20 }}
  showsVerticalScrollIndicator={false}
>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Añadir Paciente</Text>
          <TouchableOpacity onPress={cerrarModalAlta}>
            <Ionicons name="close-circle" size={28} color="red" />
          </TouchableOpacity>
        </View>

        <Text style={styles.modalLabel}>Nombre:</Text>
        <TextInput style={styles.modalInput} placeholder="Nombre" value={formData.nombre} onChangeText={(t) => handleChange('nombre', t)} />

        <Text style={styles.modalLabel}>Apellidos:</Text>
        <TextInput style={styles.modalInput} placeholder="Apellidos" value={formData.apellidos} onChangeText={(t) => handleChange('apellidos', t)} />

        <Text style={styles.modalLabel}>Fecha de nacimiento:</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={formData.fechaNacimiento}
            onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
            style={styles.webDateInput}
          />
        ) : (
          <>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.modalInput}>
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

        <Text style={styles.modalLabel}>DNI:</Text>
        <TextInput style={styles.modalInput} placeholder="DNI" value={formData.dni} onChangeText={(t) => handleChange('dni', t)} />

        <Text style={styles.modalLabel}>Email:</Text>
        <TextInput style={styles.modalInput} placeholder="Email" value={formData.email} onChangeText={(t) => handleChange('email', t)} keyboardType="email-address" />

        <Text style={styles.modalLabel}>Teléfono:</Text>
        <TextInput style={styles.modalInput} placeholder="Teléfono" value={formData.telefono} onChangeText={(t) => handleChange('telefono', t)} keyboardType="phone-pad" />

        <View style={styles.checkboxRow}>
          <Checkbox status={formData.beca ? 'checked' : 'unchecked'} onPress={() => handleChange('beca', !formData.beca)} />
          <Text style={styles.checkboxLabel}>Beca</Text>
        </View>
        {formData.beca && (
          <>
            <Text style={styles.modalLabel}>Tipo de beca:</Text>
            <TextInput style={styles.modalInput} placeholder="Tipo de beca" value={formData.tipoBeca} onChangeText={(t) => handleChange('tipoBeca', t)} />
          </>
        )}

        <View style={styles.checkboxRow}>
          <Checkbox status={formData.pagado ? 'checked' : 'unchecked'} onPress={() => handleChange('pagado', !formData.pagado)} />
          <Text style={styles.checkboxLabel}>Pagado</Text>
        </View>
        {formData.pagado && (
          <>
            <Text style={styles.modalLabel}>Método de pago:</Text>
            <Picker selectedValue={formData.metodoPago} onValueChange={(value) => handleChange('metodoPago', value)} style={styles.picker}>
              <Picker.Item label="Efectivo" value="Efectivo" />
              <Picker.Item label="Bizum" value="Bizum" />
              <Picker.Item label="Transferencia" value="Transferencia" />
              <Picker.Item label="Tarjeta" value="Tarjeta" />
            </Picker>

            <View style={styles.checkboxRow}>
              <Checkbox status={formData.recibo ? 'checked' : 'unchecked'} onPress={() => handleChange('recibo', !formData.recibo)} />
              <Text style={styles.checkboxLabel}>Recibo</Text>
            </View>
          </>
        )}

        <Text style={styles.modalLabel}>Estado:</Text>
        <Picker selectedValue={formData.estado} onValueChange={(itemValue) => handleChange('estado', itemValue)} style={styles.picker}>
          <Picker.Item label="Activo" value="Activo" />
          <Picker.Item label="Inactivo" value="Inactivo" />
        </Picker>

        <Text style={styles.modalLabel}>Diagnóstico:</Text>
        <TextInput style={styles.modalInput} placeholder="Diagnóstico" value={formData.diagnostico} onChangeText={(t) => handleChange('diagnostico', t)} />

        <TouchableOpacity style={styles.botonGuardar} onPress={guardarPaciente}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>GUARDAR PACIENTE</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
</Modal>

<Modal
  visible={modalEditarVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={cerrarModalEditar}
>
  <View style={styles.modalBackground}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.modalContent}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Editar Paciente</Text>
          <TouchableOpacity onPress={cerrarModalEditar}>
            <Ionicons name="close-circle-outline" size={28} color="#e74c3c" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nombre:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={formEditarData.nombre}
          onChangeText={(t) => handleChangeEditar('nombre', t)}
        />

        <Text style={styles.label}>Apellidos:</Text>
        <TextInput
          style={styles.input}
          placeholder="Apellidos"
          value={formEditarData.apellidos}
          onChangeText={(t) => handleChangeEditar('apellidos', t)}
        />

        <Text style={styles.label}>Fecha de nacimiento:</Text>
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
                value={
                  formEditarData.fechaNacimiento
                    ? new Date(formEditarData.fechaNacimiento)
                    : new Date()
                }
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

        <Text style={styles.label}>DNI:</Text>
        <TextInput
          style={styles.input}
          placeholder="DNI"
          value={formEditarData.dni}
          onChangeText={(t) => handleChangeEditar('dni', t)}
        />

        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formEditarData.email}
          onChangeText={(t) => handleChangeEditar('email', t)}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Teléfono:</Text>
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
          <>
            <Text style={styles.label}>Tipo de beca:</Text>
            <TextInput
              style={styles.input}
              placeholder="Tipo de beca"
              value={formEditarData.tipoBeca}
              onChangeText={(t) => handleChangeEditar('tipoBeca', t)}
            />
          </>
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
            <Text style={styles.label}>Método de pago:</Text>
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

        <Text style={styles.label}>Estado:</Text>
        <Picker
          selectedValue={formEditarData.estado}
          onValueChange={(itemValue) => handleChangeEditar('estado', itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Activo" value="Activo" />
          <Picker.Item label="Inactivo" value="Inactivo" />
        </Picker>

        <Text style={styles.label}>Diagnóstico:</Text>
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
<Modal
  visible={modalDetalleVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={cerrarModalDetalle}
>
  <View style={styles.modalBackground}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.modalContent}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Detalle del Paciente</Text>
          <TouchableOpacity onPress={cerrarModalDetalle}>
            <Ionicons name="close-circle-outline" size={28} color="#e74c3c" />
          </TouchableOpacity>
        </View>

        {pacienteDetalle && (
          <>
            <Text style={styles.modalLabel}>Nombre:</Text>
            <Text style={styles.modalInput}>{pacienteDetalle.nombre}</Text>

            <Text style={styles.modalLabel}>Apellidos:</Text>
            <Text style={styles.modalInput}>{pacienteDetalle.apellidos}</Text>

            <Text style={styles.modalLabel}>Fecha de nacimiento:</Text>
            <Text style={styles.modalInput}>
              {pacienteDetalle.fechaNacimiento?.toDate
                ? pacienteDetalle.fechaNacimiento.toDate().toLocaleDateString()
                : pacienteDetalle.fechaNacimiento}
            </Text>

            <Text style={styles.modalLabel}>DNI:</Text>
            <Text style={styles.modalInput}>{pacienteDetalle.dni}</Text>

            <Text style={styles.modalLabel}>Email:</Text>
            <Text style={styles.modalInput}>{pacienteDetalle.email}</Text>

            <Text style={styles.modalLabel}>Teléfono:</Text>
            <Text style={styles.modalInput}>{pacienteDetalle.telefono}</Text>

            <Text style={styles.modalLabel}>Estado:</Text>
            <Text style={styles.modalInput}>{pacienteDetalle.estado}</Text>

            {pacienteDetalle.beca && (
              <>
                <Text style={styles.modalLabel}>Tipo de beca:</Text>
                <Text style={styles.modalInput}>{pacienteDetalle.tipoBeca}</Text>
              </>
            )}

            {pacienteDetalle.pagado && (
              <>
                <Text style={styles.modalLabel}>Método de pago:</Text>
                <Text style={styles.modalInput}>{pacienteDetalle.metodoPago}</Text>

                <Text style={styles.modalLabel}>Recibo:</Text>
                <Text style={styles.modalInput}>{pacienteDetalle.recibo ? 'Sí' : 'No'}</Text>
              </>
            )}

            <Text style={styles.modalLabel}>Diagnóstico:</Text>
            <Text style={styles.modalInput}>{pacienteDetalle.diagnostico || '-'}</Text>
          </>
        )}
        <View style={styles.iconosAcciones}>
  <TouchableOpacity onPress={() => manejarEditar(pacienteDetalle)} style={styles.iconoAccion}>
    <Ionicons name="create-outline" size={28} color="#2b7a78" />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => confirmarEliminar(pacienteDetalle.id)} style={styles.iconoAccionEliminar}>
    <Ionicons name="trash-outline" size={28} color="#e74c3c" />
  </TouchableOpacity>
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
  borderRadius: 12,
  padding: 24,
  width: 600,
  maxWidth: '90%',
  alignSelf: 'center',
  maxHeight: '85%',
  justifyContent: 'flex-start',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 5,
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
modalTitle: {
  fontSize: 22,
  fontWeight: '700',
  color: '#2b7a78',
  textAlign: 'center',
  flex: 1,
},
modalLabel: {
  fontWeight: '600',
  marginTop: 12,
  marginBottom: 4,
  color: '#333',
},
modalInput: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
},
webDateInput: {
  width: '100%',
  marginBottom: 12,
  padding: 10,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#ccc',
  borderStyle: 'solid',
  fontSize: 16,
},

botonGuardar: {
  marginTop: 20,
  backgroundColor: '#2b7a78',
  padding: 14,
  borderRadius: 8,
  alignItems: 'center',
},

});

