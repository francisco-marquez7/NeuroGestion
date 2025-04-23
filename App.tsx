import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importamos las pantallas
import Login from './pantallas/Login';
import Registro from './pantallas/Registro';
import RecuperarContraseña from './pantallas/RecuperarContraseña';
import Inicio from './pantallas/Inicio';
import Pacientes from './pantallas/Pacientes';
import AltaPaciente from './pantallas/AltaPaciente';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Registro" component={Registro} />
        <Stack.Screen name="RecuperarContraseña" component={RecuperarContraseña} />
        <Stack.Screen name="Inicio" component={Inicio} />
        <Stack.Screen name="Pacientes" component={Pacientes}/>
        <Stack.Screen name="AltaPaciente" component={AltaPaciente} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
