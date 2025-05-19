import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  ImageBackground,
  Linking,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, Query, deleteDoc, doc,addDoc} from 'firebase/firestore';
import { db } from '../firebase/firestoreService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useUsuario } from '../context/UsuarioContext';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

const Documentos = () => {
  const navigation = useNavigation();
  const { usuario } = useUsuario();

  const [categorias, setCategorias] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [busquedaCategorias, setBusquedaCategorias] = useState('');
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [showDateInicio, setShowDateInicio] = useState(false);
  const [showDateFin, setShowDateFin] = useState(false);
  const [documentos, setDocumentos] = useState([]);
  const [categoriaSubida, setCategoriaSubida] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<any>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);



  useEffect(() => {
    const q = query(collection(db, 'categoriasDocumentos'), where('activo', '==', true));
    const unsubscribe = onSnapshot(q, snapshot => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategorias(cats);
      setCategoriasSeleccionadas(cats.map(c => c.id));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = cargarDocumentos();
    return () => unsubscribe && unsubscribe();
  }, [categoriasSeleccionadas, fechaInicio, fechaFin]);

  const cargarDocumentos = () => {
    const ref = collection(db, 'documentos');
    let q: Query = ref;
    const filtros = [];

    if (categoriasSeleccionadas.length > 0) filtros.push(where('categoriaId', 'in', categoriasSeleccionadas));
    if (fechaInicio) filtros.push(where('fechaSubida', '>=', fechaInicio));
    if (fechaFin) filtros.push(where('fechaSubida', '<=', fechaFin));

    if (filtros.length > 0) q = query(ref, ...filtros);

    const unsubscribe = onSnapshot(q, snapshot => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocumentos(docs);
    });

    return unsubscribe;
  };
  const onLimpiarFiltros = () => {
    setCategoriasSeleccionadas(categorias.map(c => c.id));
    setFechaInicio(null);
    setFechaFin(null);
    setBusquedaCategorias('');
    setDocumentos([]);
  };

  const categoriasFiltradas = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(busquedaCategorias.toLowerCase())
  );

  const confirmarEliminar = (id: string) => {
  Alert.alert(
    'Eliminar documento',
    '¿Seguro que deseas eliminar este documento?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => eliminarDocumento(id),
      },
    ]
  );
};

const eliminarDocumento = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'documentos', id));
    Alert.alert('Eliminado', 'Documento eliminado correctamente');
  } catch (err) {
    Alert.alert('Error', 'No se pudo eliminar');
    console.error('Error eliminando documento:', err);
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
          <Text style={styles.navText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Documentos</Text>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Perfil')}>
          <Ionicons name="person-circle-outline" size={28} color="#fff" />
          <Text style={styles.navText}>{usuario?.nombre || 'Perfil'}</Text>
        </TouchableOpacity>
      </View>

      <ImageBackground
        source={require('../assets/imagenes/imagenFondo.jpg')}
        style={styles.fondoImagen}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.filtrosContainer}>
          <View style={styles.card}>
            <Text style={styles.titulo}>Categorías</Text>
            <TextInput
              placeholder="Buscar categorías..."
              value={busquedaCategorias}
              onChangeText={setBusquedaCategorias}
              style={styles.inputBusqueda}
            />
            <ScrollView style={styles.scrollCategorias}>
              {categoriasFiltradas.map(cat => {
                const seleccionado = categoriasSeleccionadas.includes(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.checkboxRow}
                    onPress={() => {
                      if (seleccionado) {
                        setCategoriasSeleccionadas(categoriasSeleccionadas.filter(c => c !== cat.id));
                      } else {
                        setCategoriasSeleccionadas([...categoriasSeleccionadas, cat.id]);
                      }
                    }}
                  >
                    <Ionicons
                      name={seleccionado ? 'checkbox' : 'square-outline'}
                      size={20}
                      color="#000"
                    />
                    <Text style={{ marginLeft: 8 }}>{cat.nombre}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

                    <View style={[styles.card, { width: 180 }]}>
            <Text style={styles.titulo}>Fechas</Text>

            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={fechaInicio ? fechaInicio.toISOString().slice(0, 10) : ''}
                onChange={(e) => {
                  const fecha = new Date(e.target.value);
                  setFechaInicio(fecha);
                }}
                style={StyleSheet.flatten(styles.fechaInputBase)}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.selectorFecha}
                  onPress={() => setShowDateInicio(true)}
                >
                  <Text>{fechaInicio ? fechaInicio.toLocaleDateString() : 'dd/mm/aaaa'}</Text>
                </TouchableOpacity>
                {showDateInicio && (
                  <DateTimePicker
                    value={fechaInicio || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDateInicio(false);
                      if (selectedDate) setFechaInicio(selectedDate);
                    }}
                    maximumDate={new Date()}
                  />
                )}
              </>
            )}

            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={fechaFin ? fechaFin.toISOString().slice(0, 10) : ''}
                onChange={(e) => {
                  const fecha = new Date(e.target.value);
                  setFechaFin(fecha);
                }}
                style={StyleSheet.flatten(styles.fechaInputBase)}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.selectorFecha}
                  onPress={() => setShowDateFin(true)}
                >
                  <Text>{fechaFin ? fechaFin.toLocaleDateString() : 'dd/mm/aaaa'}</Text>
                </TouchableOpacity>
                {showDateFin && (
                  <DateTimePicker
                    value={fechaFin || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDateFin(false);
                      if (selectedDate) setFechaFin(selectedDate);
                    }}
                    maximumDate={new Date()}
                  />
                )}
              </>
            )}
          </View>
        </View>

        <View style={styles.botonesContainer}>
          <TouchableOpacity
  style={styles.btnLimpiar}
  onPress={onLimpiarFiltros}
>
  <Text style={[styles.btnText, { color: '#fff' }]}>Eliminar filtros</Text>
</TouchableOpacity>
        </View>
        <FlatList
  data={documentos}
  keyExtractor={item => item.id}
  numColumns={2}
  columnWrapperStyle={{ justifyContent: 'space-between' }}
  contentContainerStyle={{
  paddingBottom: 20,
  paddingTop: 10,
}}renderItem={({ item }) => (
  <Pressable
    style={[
      styles.cardDocumento,
      hoveredId === item.id && styles.cardHover,
    ]}
    onPress={() =>
      item.urlArchivo
        ? Linking.openURL(item.urlArchivo)
        : Alert.alert('Documento no disponible')
    }
  >
    <Text style={styles.docTitulo} numberOfLines={1}>{item.titulo}</Text>
    <Text style={styles.docDescripcion} numberOfLines={1}>{item.descripcion}</Text>
    <Text style={styles.docCategoria}>
      {categorias.find(c => c.id === item.categoriaId)?.nombre || 'Sin categoría'}
    </Text>
    <Text style={styles.docFecha}>
      {item.fechaSubida?.seconds
        ? new Date(item.fechaSubida.seconds * 1000).toLocaleDateString()
        : ''}
    </Text>

    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 10 }}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() =>
          item.urlArchivo
            ? Linking.openURL(item.urlArchivo)
            : Alert.alert('Documento no disponible')
        }
      >
        <Ionicons name="eye-outline" size={22} color="#3aafa9" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => confirmarEliminar(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  </Pressable>
)}
  ListEmptyComponent={<Text style={styles.noDocsText}>No hay documentos</Text>}
/>

<TouchableOpacity style={styles.botonSubir} onPress={() => setModalVisible(true)}>
  <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
  <Text style={styles.botonSubirTexto}>Subir documento</Text>
</TouchableOpacity>


        <Modal
  visible={modalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={[styles.modalContent, { paddingTop: 30 }]}>
      
      <TouchableOpacity
        onPress={() => setModalVisible(false)}
        style={{ position: 'absolute', top: 10, right: 10 }}
      >
        <Ionicons name="close" size={24} color="#666" />
      </TouchableOpacity>

      <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 20, textAlign: 'center' }}>
        Añadir archivo
      </Text>

      <TextInput
        placeholder="Buscar categoría..."
        value={busquedaCategorias}
        onChangeText={setBusquedaCategorias}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 6,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 16,
          marginBottom: 10,
        }}
      />

      {busquedaCategorias.trim() !== '' && (
        <ScrollView style={{ maxHeight: 150, marginBottom: 10 }}>
          {categoriasFiltradas.map(cat => (
            <TouchableOpacity
  key={cat.id}
  style={{
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: categoriaSubida === cat.id ? '#3aafa9' : '#eee',
    marginBottom: 4,
    borderRadius: 4,
  }}
  onPress={() => {
    setCategoriaSubida(cat.id);
    setBusquedaCategorias(cat.nombre);
  }}
>
  <Text style={{ fontSize: 14, color: categoriaSubida === cat.id ? '#fff' : '#000' }}>
    {cat.nombre}
  </Text>
</TouchableOpacity>

          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#eee',
          padding: 10,
          borderRadius: 6,
          marginBottom: 15,
        }}
        onPress={async () => {
          const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
          if (!result.canceled) {
            setArchivoSeleccionado(result.assets[0]);
          }
        }}
      >
        <Ionicons name="add-circle-outline" size={20} color="#333" />
        <Text style={{ marginLeft: 8 }}>
          {archivoSeleccionado?.name || 'Seleccionar archivo'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          if (!archivoSeleccionado || !categoriaSubida) {
            Alert.alert('Completa todos los campos');
            return;
          }

          try {
            const response = await fetch(archivoSeleccionado.uri);
            const blob = await response.blob();

            const formData = new FormData();
            formData.append('file', {
              uri: archivoSeleccionado.uri,
              name: archivoSeleccionado.name,
              type: archivoSeleccionado.mimeType || 'application/pdf',
            } as any);
            formData.append('upload_preset', 'doc_unsigned');
            formData.append('folder', 'documentos');

            const res = await axios.post(
              'https://api.cloudinary.com/v1_1/dkfork2cp/auto/upload',
              formData,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            const urlArchivo = res.data.secure_url;

            await addDoc(collection(db, 'documentos'), {
              titulo: archivoSeleccionado.name,
              descripcion: 'Documento subido por el usuario',
              categoriaId: categoriaSubida,
              fechaSubida: new Date(),
              urlArchivo,
              usuario,
              visibleParaUsuarios: true,
            });

            Alert.alert('Éxito', `El archivo "${archivoSeleccionado.name}" ha sido subido correctamente`);
            setModalVisible(false);
            setArchivoSeleccionado(null);
            setCategoriaSubida('');
            setBusquedaCategorias('');
          } catch (error) {
            console.error('Error al subir documento:', error);
            Alert.alert('Error', 'No se pudo subir el documento');
          }
        }}
      >
        <TouchableOpacity style={styles.botonSubir}>
  <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
  <Text style={styles.botonSubirTexto}>Subir documento</Text>
</TouchableOpacity>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', backgroundColor: 'transparent' },
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
  content: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  filtrosContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    elevation: 3,
    maxHeight: 250,
  },
  titulo: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  inputBusqueda: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 8,
  },
  scrollCategorias: {
    maxHeight: 170,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  selectorFecha: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 12,
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  docItem: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },

  noDocsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
  cardDocumentoPressed: {
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 6,
  transform: [{ scale: 1.02 }],
},
cardDocumento: {
  backgroundColor: '#fff',
  padding: 14,
  borderRadius: 10,
  width: '20%',
  marginBottom: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
  alignSelf: 'center',
  alignItems: 'center', // centra el contenido
},
docTitulo: {
  fontSize: 16,
  color: '#2b7a78',
  fontWeight: 'bold',
  textAlign: 'center',
},
docDescripcion: {
  fontSize: 14,
  color: '#555',
  marginTop: 4,
  textAlign: 'left',
},
docCategoria: {
  fontSize: 12,
  fontStyle: 'italic',
  color: '#777',
  marginTop: 4,
  textAlign: 'left',
},
docFecha: {
  fontSize: 13,
  color: '#aaa',
  marginTop: 2,
  textAlign: 'left',
},

btnVer: {
  backgroundColor: '#3aafa9',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 6,
  alignSelf: 'flex-start',
  marginTop: 10,
},
btnVerTexto: {
  color: '#fff',
  fontWeight: 'bold',
},
btnSubir: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#2ecc71', 
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 6,
  alignSelf: 'center',
  marginBottom: 20,
},

btnEliminar: {
  backgroundColor: '#2ecc71',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 6,
  alignSelf: 'flex-start',
},
modalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.4)',
},
modalContent: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 8,
  width: '80%',
  maxHeight: '80%',
},
iconButton: {
  padding: 6,
  borderRadius: 50,
  backgroundColor: 'rgba(0,0,0,0.05)',
},
btnLimpiar: {
  backgroundColor: '#a0cfc6', 
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 6,
  marginHorizontal: 10,
},
btnSubirModal: {
  backgroundColor: '#2b7a78',
  paddingVertical: 12,
  borderRadius: 6,
  alignItems: 'center',
  marginTop: 10,
},
fechaInputBase: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 6,
  paddingVertical: 12,
  paddingHorizontal: 10,
  marginBottom: 12,
  width: '100%',
  fontSize: 16,
},
cardHover: {
  transform: [{ scale: 1.02 }],
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 6,
},
botonSubir: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#2b7a78',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignSelf: 'center',
  marginBottom: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},

botonSubirTexto: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},

});

export default Documentos;
