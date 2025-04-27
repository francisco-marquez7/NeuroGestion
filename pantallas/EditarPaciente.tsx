import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Button,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
  ImageBackground
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { actualizarPaciente } from '../firebase/firestoreService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Checkbox } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function EditarPaciente() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { paciente: any } }, 'params'>>();
  const [paciente, setPaciente] = useState<any>({
    ...route.params.paciente,
    fechaNacimiento: route.params.paciente.fechaNacimiento?.toDate?.()?.toISOString().split('T')[0] || ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleGuardar = async () => {
    try {
      const pacienteFormateado = {
        ...paciente,
        fechaNacimiento: new Date(paciente.fechaNacimiento),
      };
      await actualizarPaciente(paciente.id, pacienteFormateado);
      navigation.goBack();
    } catch (error) {
      alert('Error al guardar los cambios');
    }
  };

  const handleChange = (campo: string, valor: any) => {
    setPaciente({ ...paciente, [campo]: valor });
  };

  return (
    <ImageBackground
      source={require('../assets/imagenes/imagenFondo.jpg')}
      style={styles.fondo}
      resizeMode="cover"
    >
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#ffffff" />
          <Text style={styles.navText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Editar Paciente</Text>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
          <Text style={styles.navText}>Usuario</Text>
        </TouchableOpacity>
      </View>
      <SafeAreaView style={{ flex: 1 }}>
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
            <TextInput style={styles.input} placeholder="Nombre" value={paciente.nombre} onChangeText={(t) => handleChange('nombre', t)} />
            <TextInput style={styles.input} placeholder="Apellidos" value={paciente.apellidos} onChangeText={(t) => handleChange('apellidos', t)} />

            <Text style={styles.label}>Fecha de nacimiento</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={paciente.fechaNacimiento}
                onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                style={styles.inputWeb}
              />
            ) : (
              <>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                  <Text style={{ color: paciente.fechaNacimiento ? '#000' : '#aaa' }}>{paciente.fechaNacimiento || 'Seleccionar fecha'}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={paciente.fechaNacimiento ? new Date(paciente.fechaNacimiento) : new Date()}
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

            <TextInput style={styles.input} placeholder="DNI" value={paciente.dni} onChangeText={(t) => handleChange('dni', t)} />
            <TextInput style={styles.input} placeholder="Email" value={paciente.email} onChangeText={(t) => handleChange('email', t)} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Teléfono" value={paciente.telefono} onChangeText={(t) => handleChange('telefono', t)} keyboardType="phone-pad" />

            <View style={styles.checkboxRow}>
              <Checkbox status={paciente.beca ? 'checked' : 'unchecked'} onPress={() => handleChange('beca', !paciente.beca)} />
              <Text style={styles.checkboxLabel}>Beca</Text>
            </View>
            {paciente.beca && (
              <TextInput style={styles.input} placeholder="Tipo de beca" value={paciente.tipoBeca} onChangeText={(t) => handleChange('tipoBeca', t)} />
            )}

            <View style={styles.checkboxRow}>
              <Checkbox status={paciente.pagado ? 'checked' : 'unchecked'} onPress={() => handleChange('pagado', !paciente.pagado)} />
              <Text style={styles.checkboxLabel}>Pagado</Text>
            </View>
            {paciente.pagado && (
              <>
                <Text style={styles.label}>Método de pago</Text>
                <Picker selectedValue={paciente.metodoPago} onValueChange={(v) => handleChange('metodoPago', v)} style={styles.picker}>
                  <Picker.Item label="Efectivo" value="Efectivo" />
                  <Picker.Item label="Bizum" value="Bizum" />
                  <Picker.Item label="Transferencia" value="Transferencia" />
                  <Picker.Item label="Tarjeta" value="Tarjeta" />
                </Picker>
              </>
            )}

            <Text style={styles.label}>Estado</Text>
            <Picker selectedValue={paciente.estado} onValueChange={(v) => handleChange('estado', v)} style={styles.picker}>
              <Picker.Item label="Activo" value="Activo" />
              <Picker.Item label="Inactivo" value="Inactivo" />
            </Picker>

            <TextInput style={styles.input} placeholder="Diagnóstico" value={paciente.diagnostico} onChangeText={(t) => handleChange('diagnostico', t)} />

            <View style={styles.botonera}>
              <Button title="Guardar Cambios" onPress={handleGuardar} color="#2b7a78" />
              <Button title="Cancelar" onPress={() => navigation.goBack()} color="#e74c3c" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
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
    alignItems: 'center',
    padding: 10,
  },  
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    opacity: 0.65,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  inputWeb: {
    width: '100%',
    padding: 8,
    marginBottom: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 14,
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
