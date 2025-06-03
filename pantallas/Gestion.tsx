import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  buscarUsuarioPorEmail,
  getUsuarios,
  addUsuario,
  updateUsuario,
  deleteUsuario,
  getEmpresas,
  addEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from '../firebase/firestoreService';
import { Picker } from '@react-native-picker/picker';
import { useUsuario } from '../context/UsuarioContext';
import {
  BarChart,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar
} from 'recharts';

const screenWidth = Dimensions.get('window').width;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A'];
const Gestion = (navigation) => {
    const { usuario } = useUsuario();
  // Estados
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);

  const [modalVisibleUser, setModalVisibleUser] = useState(false);
  const [modalVisibleEmpresa, setModalVisibleEmpresa] = useState(false);

  const [editUser, setEditUser] = useState(null);
  const [editEmpresa, setEditEmpresa] = useState(null);

  
  // Formularios
  const [formUser, setFormUser] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    empresaId: '',
    rol: '',
  });
  const [formEmpresa, setFormEmpresa] = useState({
    nombreEmpresa: '',
    direccion: '',
    email: '',
    telefono: '',
    sector: '',
    fechaAlta: '',
  });

  // Filtros
  const [filtroUsuarios, setFiltroUsuarios] = useState('');
  const [filtroEmpresas, setFiltroEmpresas] = useState('');

  // Ordenación usuarios
  const [ordenUsuarios, setOrdenUsuarios] = useState({ campo: 'nombre', asc: true });

useEffect(() => {
  const cargarUsuarios = async () => {
    const usuariosData = await getUsuarios();
    setUsuarios(usuariosData);
  };
  cargarUsuarios();
}, []);

  useEffect(() => {
    const cargarEmpresas = async () => {
      const empresasData = await getEmpresas();
      setEmpresas(empresasData);
    };
    cargarEmpresas();
  }, []);

  console.log('Usuario:', usuario);
if (!usuario) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'white' }}>Acceso denegado. Usuario no encontrado.</Text>
      </View>
    );
  }

  if (usuario.rol.trim().toLowerCase() !== 'admin') {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'white' }}>Acceso denegado</Text>
      </View>
    );
  }

  // Control formularios
  const onChangeUser = (field, value) => setFormUser((prev) => ({ ...prev, [field]: value }));
  const onChangeEmpresa = (field, value) => setFormEmpresa((prev) => ({ ...prev, [field]: value }));

  // Abrir modales
  const openModalUser = (user = null) => {
    if (user) {
      setEditUser(user);
      setFormUser({
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        empresaId: user.empresaId || '',
        rol: user.rol || '',
      });
    } else {
      setEditUser(null);
      setFormUser({ nombre: '', apellidos: '', email: '', empresaId: '', rol: '' });
    }
    setModalVisibleUser(true);
  };
  const openModalEmpresa = (empresa = null) => {
    if (empresa) {
      setEditEmpresa(empresa);
      setFormEmpresa({
        nombreEmpresa: empresa.nombreEmpresa || '',
        direccion: empresa.direccion || '',
        email: empresa.email || '',
        telefono: empresa.telefono || '',
        sector: empresa.sector || '',
        fechaAlta: empresa.fechaAlta
          ? new Date(empresa.fechaAlta.seconds * 1000).toISOString().split('T')[0]
          : '',
      });
    } else {
      setEditEmpresa(null);
      setFormEmpresa({
        nombreEmpresa: '',
        direccion: '',
        email: '',
        telefono: '',
        sector: '',
        fechaAlta: '',
      });
    }
    setModalVisibleEmpresa(true);
  };

const saveUser = async () => {
  const { nombre, apellidos, email, empresaId, rol } = formUser;
  if (!nombre || !apellidos || !email || !empresaId || !rol) {
    Alert.alert('Error', 'Por favor, rellena todos los campos.');
    return;
  }
  try {
    if (editUser) {
      await updateUsuario(editUser.id, formUser);
    } else {
      await addUsuario(formUser);
    }
    setModalVisibleUser(false);
    const usuariosData = await getUsuarios();
    setUsuarios(usuariosData); // Actualiza los usuarios correctamente
  } catch (error) {
    Alert.alert('Error', 'Error guardando usuario: ' + error.message);
  }
};



const saveEmpresa = async () => {
  const { nombreEmpresa, direccion, email, telefono, sector, fechaAlta } = formEmpresa;
  if (!nombreEmpresa || !direccion || !email || !telefono || !sector || !fechaAlta) {
    Alert.alert('Error', 'Por favor, rellena todos los campos.');
    return;
  }
  try {
    const fecha = new Date(fechaAlta);
    const empresaData = {
      nombreEmpresa,
      direccion,
      email,
      telefono,
      sector,
      fechaAlta: { seconds: Math.floor(fecha.getTime() / 1000) }, // o guarda ISO y ajusta en la UI
    };
    if (editEmpresa) {
      await updateEmpresa(editEmpresa.id, empresaData);
    } else {
      await addEmpresa(empresaData);
    }
    setModalVisibleEmpresa(false);
    const empresasData = await getEmpresas();
    setEmpresas(empresasData); // Actualizar empresas correctamente
  } catch (error) {
    Alert.alert('Error', 'Error guardando empresa: ' + error.message);
  }
};

const confirmarEliminar = (id: string) => {
  Alert.alert(
    'Confirmar eliminación',
    '¿Eliminar usuario?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => borrarUsuario(id),
      },
    ],
    { cancelable: true }
  );
};

const borrarUsuario = async (id: string) => {
  try {
    await deleteUsuario(id);
    const usuariosData = await getUsuarios();
    setUsuarios(usuariosData);
    console.log('Usuario eliminado:', id);
  } catch (error: any) {
    Alert.alert('Error', 'No se pudo eliminar usuario: ' + error.message);
  }
};



const deleteEmpresa = (id) => {
  Alert.alert('Confirmar eliminación', '¿Eliminar empresa y sus usuarios?', [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Eliminar',
      style: 'destructive',
      onPress: async () => {
        try {
          // Aquí idealmente eliminarías usuarios asociados, pero no tienes función batch en servicio
          // Por simplicidad elimina empresa directo:
          await deleteEmpresa(id);
          const empresasData = await getEmpresas();
          setEmpresas(empresasData);
          const usuariosData = await getUsuarios();
          setUsuarios(usuariosData);
        } catch (error) {
          Alert.alert('Error', 'No se pudo eliminar empresa: ' + error.message);
        }
      },
    },
  ]);
};
const usuariosFiltrados = usuarios.filter((u) => {
  const empresaNombre = empresas.find((e) => e.id === u.empresaId)?.nombreEmpresa || '';
  const filtro = filtroUsuarios.toLowerCase();

  const nombre = u.nombre ? u.nombre.toLowerCase() : '';
  const apellidos = u.apellidos ? u.apellidos.toLowerCase() : '';
  const email = u.email ? u.email.toLowerCase() : '';
  const rol = u.rol ? u.rol.toLowerCase() : '';
  const empresa = empresaNombre.toLowerCase();

  return (
    nombre.includes(filtro) ||
    apellidos.includes(filtro) ||
    email.includes(filtro) ||
    empresa.includes(filtro) ||
    rol.includes(filtro)
  );
});

  const empresasFiltradas = empresas.filter((e) => {
    const filtro = filtroEmpresas.toLowerCase();
    return (
      e.nombreEmpresa.toLowerCase().includes(filtro) ||
      e.sector.toLowerCase().includes(filtro) ||
      e.email.toLowerCase().includes(filtro)
    );
  });

  // Ordenación usuarios
  const ordenarUsuarios = (campo) => {
    const asc = ordenUsuarios.campo === campo ? !ordenUsuarios.asc : true;
    setOrdenUsuarios({ campo, asc });
  };

  const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
    if (!a[ordenUsuarios.campo]) return 1;
    if (!b[ordenUsuarios.campo]) return -1;
    if (a[ordenUsuarios.campo] < b[ordenUsuarios.campo]) return ordenUsuarios.asc ? -1 : 1;
    if (a[ordenUsuarios.campo] > b[ordenUsuarios.campo]) return ordenUsuarios.asc ? 1 : -1;
    return 0;
  });

  // Datos gráficos

  // Usuarios por empresa
  const usuariosPorEmpresa = empresas.map((emp) => ({
    nombreEmpresa: emp.nombreEmpresa,
    usuarios: usuarios.filter((u) => u.empresaId === emp.id).length,
  }));

  // Distribución usuarios por rol
  const rolesCount = usuarios.reduce((acc, u) => {
    acc[u.rol] = (acc[u.rol] || 0) + 1;
    return acc;
  }, {});
  const dataRoles = Object.entries(rolesCount).map(([key, value]) => ({
    name: key,
    value,
  }));

  // Empresas por sector
  const empresasPorSectorCount = empresas.reduce((acc, e) => {
    acc[e.sector] = (acc[e.sector] || 0) + 1;
    return acc;
  }, {});
  const dataEmpresasPorSector = Object.entries(empresasPorSectorCount).map(([key, value]) => ({
    sector: key,
    cantidad: value,
  }));

  // Exportar CSV
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [];

    csvRows.push(headers.join(','));

    data.forEach((row) => {
      const values = headers.map((h) => {
        let val = row[h];
        if (typeof val === 'string') {
          val = val.replace(/"/g, '""');
          return `"${val}"`;
        }
        return val;
      });
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');

    if (typeof window !== 'undefined') {
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      Alert.alert('Error', 'Exportación CSV solo soportada en web');
    }
  };

  const formatFecha = (fecha: any) => {
  if (!fecha) return '-';
  if (fecha.seconds) return new Date(fecha.seconds * 1000).toLocaleDateString();
  return new Date(fecha).toLocaleDateString();
};

  // Render usuario tabla
  const renderUsuario = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 1 }]}>{item.nombre}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.apellidos}</Text>
      <Text style={[styles.cell, { flex: 2 }]}>{item.email}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{formatFecha(item.fechaAlta)}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>
        {empresas.find((e) => e.id === item.empresaId)?.nombreEmpresa || '-'}
      </Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.rol}</Text>
     <View style={[styles.cell, { flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
  <TouchableOpacity onPress={() => openModalUser(item)} style={{ marginRight: 12 }}>
    <Ionicons name="pencil-outline" size={22} color="#007bff" />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => confirmarEliminar(item.id)}>
  <Ionicons name="trash-outline" size={22} color="#dc3545" />
</TouchableOpacity>

</View>
    </View>
  );

  // Render empresa tabla
  const renderEmpresa = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 2 }]}>{item.nombreEmpresa}</Text>
      <Text style={[styles.cell, { flex: 2 }]}>{item.direccion}</Text>
      <Text style={[styles.cell, { flex: 2 }]}>{item.email}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.telefono}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.sector}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>
        {item.fechaAlta ? new Date(item.fechaAlta.seconds * 1000).toLocaleDateString() : '-'}
      </Text>
      <Text style={[styles.cell, { flex: 1 }]}>
        {usuarios.filter((u) => u.empresaId === item.id).length}
      </Text>
      <View style={[styles.cell, { flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
  <TouchableOpacity onPress={() => openModalEmpresa(item)} style={{ marginRight: 12 }}>
    <Ionicons name="pencil-outline" size={22} color="#007bff" />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => deleteEmpresa(item.id)}>
    <Ionicons name="trash-outline" size={22} color="#dc3545" />
  </TouchableOpacity>
</View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
              <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                <Text style={styles.navText}>Volver</Text>
              </TouchableOpacity>
              <Text style={styles.navTitle}>Gestión</Text>
              <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Perfil')}>
                <Text style={styles.navText}>{usuario?.nombre || 'Perfil'}</Text>
                <Ionicons name="person-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
       </View>
      <ImageBackground
        source={require('../assets/imagenes/imagenFondo.jpg')}
        style={styles.fondoImagen}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usuarios</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <TouchableOpacity style={styles.btnAdd} onPress={() => openModalUser()}>
                <Text style={styles.btnAddText}>Añadir usuario +</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAdd, { backgroundColor: '#444' }]}
                onPress={() => exportToCSV(usuariosOrdenados, 'usuarios.csv')}
              >
                <Text style={{ color: 'white' }}>Exportar Usuarios CSV</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Buscar por nombre, email, empresa, rol..."
              value={filtroUsuarios}
              onChangeText={setFiltroUsuarios}
              style={styles.inputFiltro}
            />

            <View style={styles.tableHeader}>
  <TouchableOpacity style={[styles.cell, { flex: 1 }]} onPress={() => ordenarUsuarios('nombre')}>
    <Text style={{ fontWeight: 'bold', color: '#444' }}>
      Nombre {ordenUsuarios.campo === 'nombre' ? (ordenUsuarios.asc ? '▲' : '▼') : ''}
    </Text>
  </TouchableOpacity>

  <TouchableOpacity style={[styles.cell, { flex: 1 }]} onPress={() => ordenarUsuarios('apellidos')}>
    <Text style={{ fontWeight: 'bold', color: '#444' }}>
      Apellidos {ordenUsuarios.campo === 'apellidos' ? (ordenUsuarios.asc ? '▲' : '▼') : ''}
    </Text>
  </TouchableOpacity>

  <TouchableOpacity style={[styles.cell, { flex: 2 }]} onPress={() => ordenarUsuarios('email')}>
    <Text style={{ fontWeight: 'bold', color: '#444' }}>
      Email {ordenUsuarios.campo === 'email' ? (ordenUsuarios.asc ? '▲' : '▼') : ''}
    </Text>
  </TouchableOpacity>

<TouchableOpacity style={[styles.cell, { flex: 2 }]} onPress={() => ordenarUsuarios('empresa')}>
  <Text style={[styles.cell, { flex: 1, fontWeight: 'bold', color: '#444' }]}>Empresa</Text>
</TouchableOpacity>

  <TouchableOpacity style={[styles.cell, { flex: 1 }]} onPress={() => ordenarUsuarios('rol')}>
    <Text style={{ fontWeight: 'bold', color: '#444' }}>
      Rol {ordenUsuarios.campo === 'rol' ? (ordenUsuarios.asc ? '▲' : '▼') : ''}
    </Text>
  </TouchableOpacity>

  <Text style={[styles.cell, { flex: 1, fontWeight: 'bold', textAlign: 'center', color: '#444' }]}>Acciones</Text>
</View>


            <FlatList
              data={usuariosOrdenados}
              keyExtractor={(item) => item.id}
              renderItem={renderUsuario}
              style={styles.table}
              nestedScrollEnabled={true}
            />
          </View>

          {/* Empresas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Empresas</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <TouchableOpacity style={styles.btnAdd} onPress={() => openModalEmpresa()}>
                <Text style={styles.btnAddText}>Añadir empresa +</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAdd, { backgroundColor: '#444' }]}
                onPress={() => exportToCSV(empresasFiltradas, 'empresas.csv')}
              >
                <Text style={{ color: 'white' }}>Exportar Empresas CSV</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Buscar por nombre, sector, email..."
              value={filtroEmpresas}
              onChangeText={setFiltroEmpresas}
              style={styles.inputFiltro}
            />
              <View style={styles.tableHeader}>
    <Text style={[styles.cell, { flex: 2, fontWeight: 'bold', color: '#444' }]}>Nombre</Text>
    <Text style={[styles.cell, { flex: 2, fontWeight: 'bold', color: '#444' }]}>Dirección</Text>
    <Text style={[styles.cell, { flex: 2, fontWeight: 'bold', color: '#444' }]}>Email</Text>
    <Text style={[styles.cell, { flex: 1, fontWeight: 'bold', color: '#444' }]}>Teléfono</Text>
    <Text style={[styles.cell, { flex: 1, fontWeight: 'bold', color: '#444' }]}>Sector</Text>
    <Text style={[styles.cell, { flex: 1, fontWeight: 'bold', color: '#444' }]}>Fecha Alta</Text>
    <Text style={[styles.cell, { flex: 1, fontWeight: 'bold', color: '#444' }]}>Usuarios</Text>
    <Text style={[styles.cell, { flex: 1, fontWeight: 'bold', textAlign: 'center', color: '#444' }]}>
      Acciones
    </Text>
  </View>

            <FlatList
              data={empresasFiltradas}
              keyExtractor={(item) => item.id}
              renderItem={renderEmpresa}
              style={styles.table}
              nestedScrollEnabled={true}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gráficos</Text>

            <Text style={styles.chartTitle}>Usuarios por Empresa</Text>
            <View style={{ width: screenWidth * 0.9, height: 250 }}>
              <BarChart
                width={screenWidth * 0.9}
                height={250}
                data={usuariosPorEmpresa}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombreEmpresa" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="usuarios" fill="#8884d8" />
              </BarChart>
            </View>

            {/* Distribución usuarios por rol */}
            <Text style={styles.chartTitle}>Distribución Usuarios por Rol</Text>
            <View style={{ width: screenWidth * 0.9, height: 250, alignItems: 'center' }}>
              <PieChart width={screenWidth * 0.9} height={250}>
                <Pie
                  data={dataRoles}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {dataRoles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </View>

            <Text style={styles.chartTitle}>Empresas por Sector</Text>
            <View style={{ width: screenWidth * 0.9, height: 250 }}>
              <BarChart
                width={screenWidth * 0.9}
                height={250}
                data={dataEmpresasPorSector}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#82ca9d" />
              </BarChart>
            </View>
          </View>
        </ScrollView>

        <Modal visible={modalVisibleUser} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{editUser ? 'Editar Usuario' : 'Añadir Usuario'}</Text>
              <ScrollView>
                <TextInput
                  placeholder="Nombre"
                  style={styles.input}
                  value={formUser.nombre}
                  onChangeText={(t) => onChangeUser('nombre', t)}
                />
                <TextInput
                  placeholder="Apellidos"
                  style={styles.input}
                  value={formUser.apellidos}
                  onChangeText={(t) => onChangeUser('apellidos', t)}
                />
                <TextInput
                  placeholder="Email"
                  style={styles.input}
                  value={formUser.email}
                  onChangeText={(t) => onChangeUser('email', t)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={{ marginBottom: 4, fontWeight: '600' }}>Empresa</Text>
                <Picker
                  selectedValue={formUser.empresaId}
                  onValueChange={(itemValue) => onChangeUser('empresaId', itemValue)}
                  style={{ marginBottom: 12 }}
                >
                  <Picker.Item label="Selecciona empresa" value="" />
                  {empresas.map((e) => (
                    <Picker.Item key={e.id} label={e.nombreEmpresa} value={e.id} />
                  ))}
                </Picker>

                <Text style={{ marginBottom: 4, fontWeight: '600' }}>Rol</Text>
                <Picker
                  selectedValue={formUser.rol}
                  onValueChange={(itemValue) => onChangeUser('rol', itemValue)}
                  style={{ marginBottom: 12 }}
                >
                    <Picker.Item label="Selecciona rol" value="" />
  <Picker.Item label="admin" value="admin" />
  <Picker.Item label="company_admin" value="company_admin" />
  <Picker.Item label="profesional" value="profesional" />
                </Picker>

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.btnSave} onPress={saveUser}>
                    <Text style={{ color: 'white' }}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => setModalVisibleUser(false)}
                  >
                    <Text style={{ color: 'black' }}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
        <Modal visible={modalVisibleEmpresa} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{editEmpresa ? 'Editar Empresa' : 'Añadir Empresa'}</Text>
              <ScrollView>
                <TextInput
                  placeholder="Nombre Empresa"
                  style={styles.input}
                  value={formEmpresa.nombreEmpresa}
                  onChangeText={(t) => onChangeEmpresa('nombreEmpresa', t)}
                />
                <TextInput
                  placeholder="Dirección"
                  style={styles.input}
                  value={formEmpresa.direccion}
                  onChangeText={(t) => onChangeEmpresa('direccion', t)}
                />
                <TextInput
                  placeholder="Email"
                  style={styles.input}
                  value={formEmpresa.email}
                  onChangeText={(t) => onChangeEmpresa('email', t)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  placeholder="Teléfono"
                  style={styles.input}
                  value={formEmpresa.telefono}
                  onChangeText={(t) => onChangeEmpresa('telefono', t)}
                  keyboardType="phone-pad"
                />
                <TextInput
                  placeholder="Sector"
                  style={styles.input}
                  value={formEmpresa.sector}
                  onChangeText={(t) => onChangeEmpresa('sector', t)}
                />
                <TextInput
                  placeholder="Fecha Alta (YYYY-MM-DD)"
                  style={styles.input}
                  value={formEmpresa.fechaAlta}
                  onChangeText={(t) => onChangeEmpresa('fechaAlta', t)}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.btnSave} onPress={saveEmpresa}>
                    <Text style={{ color: 'white' }}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => setModalVisibleEmpresa(false)}
                  >
                    <Text style={{ color: 'black' }}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
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
  fondoImagen: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 60,
  },
  scrollContent: { padding: 20, minHeight: '100%' },

  section: { marginBottom: 40 },
sectionTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#2b7a78',
  textAlign: 'center',
  marginBottom: 10,
},

  table: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  tableHeader: {
  flexDirection: 'row',
  backgroundColor: '#2b7a78',
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderColor: '#ccc',
},

cell: {
  paddingHorizontal: 6,
  paddingVertical: 4,
  fontSize: 14,
  color: '#444',
},
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: '#fff',
  },
  btnAdd: {
    backgroundColor: '#0a7d0a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  btnAddText: { color: 'white', fontWeight: 'bold' },

  btnEdit: {
    backgroundColor: '#007bff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    borderRadius: 4,
  },
  btnDelete: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },

  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    color: '#fff',
    marginBottom: 10,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: Platform.OS === 'web' ? 600 : '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  inputFiltro: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 16,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnSave: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  btnCancel: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
});

export default Gestion;
