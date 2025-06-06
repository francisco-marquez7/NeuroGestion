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
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

const Documentos = () => {
  const { usuario } = useUsuario();
type NavigationProp = StackNavigationProp<RootStackParamList, 'Documentos'>;
const navigation = useNavigation<NavigationProp>();
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
  const [hoveredId] = useState<string | null>(null);
const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
const [nombreCategoria, setNombreCategoria] = useState('');
const [iconoCategoria, setIconoCategoria] = useState('');
const [showTooltip, setShowTooltip] = useState<boolean>(false);
const [descripcionDocumento, setDescripcionDocumento] = useState('');




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
  if (Platform.OS === 'web') {
    if (window.confirm('¿Seguro que deseas eliminar este documento?')) {
      eliminarDocumento(id);
    }
  } else {
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
      ],
      { cancelable: true }
    );
  }
};


const eliminarDocumento = async (id: string) => {
  console.log('Intentando eliminar documento con id:', id);
  try {
    const docRef = doc(db, 'documentos', id);
    console.log('Referencia documento:', docRef.path);

    await deleteDoc(docRef);
    
    console.log('Documento eliminado correctamente');
    Alert.alert('Eliminado', 'Documento eliminado correctamente');
  } catch (err) {
    console.error('Error eliminando documento:', err);
    Alert.alert('Error', 'No se pudo eliminar el documento. Revisa consola para más detalles.');
  }
};


const guardarCategoria = async () => {
  if (!nombreCategoria || !iconoCategoria) {
    Alert.alert('Completa los campos');
    return;
  }

  try {
    await addDoc(collection(db, 'categoriasDocumentos'), {
      nombre: nombreCategoria,
      icono: iconoCategoria,
      activo: true,
    });

    Alert.alert('Categoría añadida');
    setModalCategoriaVisible(false);
    setNombreCategoria('');
    setIconoCategoria('');
  } catch (err) {
    Alert.alert('Error', 'No se pudo guardar');
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
          <Text style={styles.navText}>{usuario?.nombre || 'Perfil'}</Text>
          <Ionicons name="person-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ImageBackground
        source={require('../assets/imagenes/imagenFondo.jpg')}
        style={styles.fondoImagen}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.filtrosContainer}>
           <View style={[styles.card, styles.cardCategorias]}>
            <View style={styles.headerCategorias}>
  <Text style={styles.titulo}>Categorías</Text>
  <TouchableOpacity
    style={styles.botonAgregarCategoria}
    onPress={() => setModalCategoriaVisible(true)}
    {...(Platform.OS === 'web'
      ? {
          onMouseEnter: () => setShowTooltip(true),
          onMouseLeave: () => setShowTooltip(false),
        }
      : {})}
  >
    <Ionicons name="add-circle-outline" size={22} color="#2b7a78" />
  </TouchableOpacity>
</View>
{Platform.OS === 'web' && showTooltip && (
  <View style={styles.tooltip}>
    <Text style={styles.tooltipText}>Añadir categoría</Text>
  </View>
)}
            <TextInput
              placeholder="Buscar categorías..."
              value={busquedaCategorias}
              onChangeText={setBusquedaCategorias}
              style={styles.inputBusqueda}
            />
            <ScrollView
  style={styles.scrollCategoriasHorizontal}
  horizontal
  showsHorizontalScrollIndicator={false}
>
              {categoriasFiltradas.map(cat => {
                const seleccionado = categoriasSeleccionadas.includes(cat.id);
                return (
                 <TouchableOpacity
  key={cat.id}
  style={[
    styles.checkboxRowHorizontal,
    seleccionado && styles.checkboxRowSelected,
  ]}

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
  size={18}
  color="#000"
/>
<Text style={styles.checkboxText}>{cat.nombre}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

            <View style={[styles.card, styles.cardFechas]}>
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
  disabled={categoriasSeleccionadas.length === categorias.length && !fechaInicio && !fechaFin}
>
  <Text style={styles.btnText}>Eliminar filtros</Text>
</TouchableOpacity>
        </View>
        <FlatList
  data={documentos}
  keyExtractor={item => item.id}
  numColumns={2}
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
   <View style={{ 
  flexDirection: 'row', 
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: 10,
  gap: 16
}}>
  <TouchableOpacity
    onPress={() =>
      item.urlArchivo
        ? window.open(item.urlArchivo, '_blank')
        : Alert.alert('Documento no disponible')
    }
    style={styles.iconButton}
  >
    <Ionicons name="download-outline" size={22} color="#3aafa9" />
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
    <Text style={styles.formLabel}>Seleccionar archivo:</Text>
{Platform.OS === 'web' ? (
  <input
    type="file"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) setArchivoSeleccionado(file);
    }}
    style={styles.formInput}
  />
) : (
  <TouchableOpacity
    style={styles.formFileInput}
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
)}

<Text style={styles.formLabel}>Descripción:</Text>
<TextInput
  placeholder="Breve descripción del documento"
  value={descripcionDocumento}
  onChangeText={setDescripcionDocumento}
  style={styles.formInput}
/>

<Text style={styles.formLabel}>Categoría:</Text>
<View style={[styles.formInput, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }]}>
  <Ionicons name="search-outline" size={20} color="#2b7a78" />
  <TextInput
    placeholder="Buscar categorías..."
    value={busquedaCategorias}
    onChangeText={setBusquedaCategorias}
    style={{ flex: 1, paddingVertical: 6, marginLeft: 6, fontSize: 16 }}
  />
</View>
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
              <Text
                style={{
                  fontSize: 14,
                  color: categoriaSubida === cat.id ? '#fff' : '#000',
                }}
              >
                {cat.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.botonSubir}
        onPress={async () => {
          const servidorLocal = Platform.OS === 'android'
            ? 'http://192.168.0.26'
            : 'http://localhost';

          const urlUpload = `${servidorLocal}/neurogestion-backend/uploads/upload.php`;

          if (!archivoSeleccionado || !categoriaSubida) {
            Alert.alert('Completa todos los campos');
            return;
          }

          try {
            const formData = new FormData();
            if (Platform.OS === 'web') {
              formData.append('file', archivoSeleccionado);
            } else {
              formData.append('file', {
                uri: archivoSeleccionado.uri,
                name: archivoSeleccionado.name,
                type: archivoSeleccionado.mimeType || 'application/pdf',
              } as any);
            }

            const res = await fetch(urlUpload, {
              method: 'POST',
              body: formData,
            });

            const texto = await res.text();
            console.log('Respuesta cruda del backend:', texto);

            let data;
            try {
              data = JSON.parse(texto);
            } catch (err) {
              throw new Error('Respuesta no es JSON válido');
            }

            if (!data.url) throw new Error('No se recibió URL');

            await addDoc(collection(db, 'documentos'), {
              titulo: archivoSeleccionado.name,
              descripcion: descripcionDocumento,
              categoriaId: categoriaSubida,
              fechaSubida: new Date(),
              urlArchivo: data.url,
              usuarioId: usuario?.id,
              visibleParaUsuarios: true,
            });

            Alert.alert('Éxito', `El archivo "${archivoSeleccionado.name}" ha sido subido correctamente`);
            setModalVisible(false);
            setArchivoSeleccionado(null);
            setDescripcionDocumento('');
            setCategoriaSubida('');
            setBusquedaCategorias('');
          } catch (error) {
            console.error('Error al subir documento:', error);
            Alert.alert('Error', 'No se pudo subir el documento');
          }
        }}
      >
        <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.botonSubirTexto}>Subir documento</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal visible={modalCategoriaVisible} transparent animationType="fade">
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      
      <TouchableOpacity
        onPress={() => setModalCategoriaVisible(false)}
        style={{ position: 'absolute', top: 10, right: 10 }}
      >
        <Ionicons name="close" size={24} color="#666" />
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Añadir categoría
      </Text>

      <TextInput
        placeholder="Nombre de la categoría"
        value={nombreCategoria}
        onChangeText={setNombreCategoria}
        style={styles.input}
      />

      <Text style={{ fontSize: 14, marginBottom: 6 }}>Selecciona un icono:</Text>
      <ScrollView horizontal contentContainerStyle={{ paddingBottom: 10 }}>
        {[
          'school-outline', 'document-text-outline', 'fitness-outline',
          'medical-outline', 'book-outline', 'bulb-outline'
        ].map(icon => (
          <TouchableOpacity
            key={icon}
            style={{
              padding: 8,
              marginRight: 8,
              backgroundColor: iconoCategoria === icon ? '#2b7a78' : '#eee',
              borderRadius: 6,
            }}
            onPress={() => setIconoCategoria(icon)}
          >
            <Ionicons name={icon as any} size={24} color={iconoCategoria === icon ? '#fff' : '#333'} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.botonSubir} onPress={guardarCategoria}>
        <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.botonSubirTexto}>Guardar</Text>
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
    borderColor: '#2b7a78',  
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 16,
  },
 scrollCategorias: {
    maxHeight: 150,
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
    padding: 12,
    borderRadius: 10,
    width: '45%',       
    marginBottom: 16,
    marginHorizontal: 8, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
    alignItems: 'flex-start', 
  },
 docTitulo: {
    fontSize: 16,
    color: '#2b7a78',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  docDescripcion: {
    fontSize: 14,
    color: '#444',         
    marginTop: 4,
    textAlign: 'left',
  },
  docCategoria: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#555',
    marginTop: 6,
    textAlign: 'left',
  },
  docFecha: {
    fontSize: 12,
    color: '#777',
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
  iconButton: {
    padding: 8,
    borderRadius: 50,
    marginHorizontal: 10,
  },
  iconButtonHover: {
    backgroundColor: '#3aafa9',
  },
  btnLimpiar: {
    backgroundColor: '#2b7a78',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
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
    backgroundColor: '#27ae60',  
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  botonSubirTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
headerCategorias: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 6,
},

botonAgregarCategoria: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'transparent',
  paddingVertical: 6,
  paddingHorizontal: 6,
  borderRadius: 6,
  elevation: 3,
},

  tooltip: {
    position: 'absolute',
    right: 10,
    top: 25,
    backgroundColor: '#2b7a78',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 999,
  },

  tooltipText: {
    color: 'white',
    fontSize: 12,
  },
  cardCategorias: {
    flex: 2,
    maxHeight: 250,
    marginRight: 15,
    padding: 15,
  },
  cardFechas: {
    flex: 1,
    maxHeight: 250,
    padding: 15,
  },
  modalContent: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 12,
  width: 400,
  maxHeight: '90%',
  alignItems: 'center',
  alignSelf: 'center',
},

input: {
  width: '100%',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
  marginBottom: 12,
},

descripcionInput: {
  width: '100%',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
  marginBottom: 12,
  textAlignVertical: 'top',
},

archivoInput: {
  width: '100%',
  padding: 10,
  borderRadius: 8,
  borderColor: '#ccc',
  borderWidth: 1,
  marginBottom: 12,
  backgroundColor: '#f5f5f5',
  justifyContent: 'center',
},
formLabel: {
  alignSelf: 'flex-start',
  fontWeight: 'bold',
  fontSize: 14,
  marginBottom: 4,
  color: '#333',
},

formInput: {
  width: '100%',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
  marginBottom: 12,
},

formFileInput: {
  width: '100%',
  padding: 10,
  borderRadius: 8,
  borderColor: '#ccc',
  borderWidth: 1,
  marginBottom: 12,
  backgroundColor: '#f5f5f5',
  justifyContent: 'center',
},
scrollCategoriasHorizontal: {
  maxHeight: 50,
},

checkboxRowHorizontal: {
  flexDirection: 'row',
  alignItems: 'center',
  marginRight: 12,
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 6,
  backgroundColor: '#eee',
},

checkboxRowSelected: {
  backgroundColor: '#d0f0f6',
},

checkboxText: {
  marginLeft: 8,
},

});

export default Documentos;
