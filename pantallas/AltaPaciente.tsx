import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Button,
  ImageBackground,
  Platform,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Checkbox } from 'react-native-paper';
import { Timestamp } from 'firebase/firestore';
import { agregarPaciente } from '../firebase/firestoreService';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

export default function AltaPaciente() {
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    diagnostico: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleGuardar = async () => {
    try {
      const pacienteFormateado = {
        ...formData,
        fechaNacimiento: Timestamp.fromDate(new Date(formData.fechaNacimiento))
      };
      await agregarPaciente(pacienteFormateado);
      navigation.goBack();
    } catch (error) {
      alert('Error al guardar paciente');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/imagenes/imagenFondo.jpg')}
      style={styles.fondo}
      resizeMode="cover"
    >
      <View style={styles.navbar}>
  {/* Botón volver */}
  <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back-outline" size={24} color="#ffffff" />
    <Text style={styles.navText}>Volver</Text>
  </TouchableOpacity>

  {/* Título centrado */}
  <Text style={styles.navTitle}>Alta de Paciente</Text>

  {/* Icono usuario */}
  <TouchableOpacity style={styles.navItem}>
    <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
    <Text style={styles.navText}>Usuario</Text>
  </TouchableOpacity>
</View>

      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>

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
              <Button title="Guardar" onPress={handleGuardar} color="#2b7a78" />
              <Button title="Cancelar" onPress={() => navigation.goBack()} color="#e74c3c" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  navbar: {
    height: 60,
    backgroundColor: '#2b7a78',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
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
  overlay: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff', 
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    opacity: 0.75,
  },  
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2b7a78',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
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
});
