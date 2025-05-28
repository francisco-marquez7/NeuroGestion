import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UsuarioProvider } from './context/UsuarioContext';

import Login from './pantallas/Login';
import Registro from './pantallas/Registro';
import RecuperarContraseña from './pantallas/RecuperarContraseña';
import Inicio from './pantallas/Inicio';
import Pacientes from './pantallas/Pacientes';
import Perfil from './pantallas/Perfil';
import CalendarioCitas from './pantallas/CalendarioCitas';
import Sesiones from './pantallas/Sesiones';
import Documentos from './pantallas/Documentos';
import Gestion from './pantallas/Gestion';

const Stack = createStackNavigator();

export default function App() {
  const login = async (email: string, password: string) => {
  };

  return (
   <UsuarioProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {(props) => <Login {...props} onLogin={login} />}
          </Stack.Screen>
          <Stack.Screen name="Registro" component={Registro} />
          <Stack.Screen name="RecuperarContraseña" component={RecuperarContraseña} />
          <Stack.Screen name="Inicio" component={Inicio} />
          <Stack.Screen name="Pacientes" component={Pacientes} />
          <Stack.Screen name="Perfil" component={Perfil} />
          <Stack.Screen name="CalendarioCitas" component={CalendarioCitas} />
          <Stack.Screen name="Sesiones" component={Sesiones} />
          <Stack.Screen name="Documentos" component={Documentos} />
          <Stack.Screen name="Gestion" component={Gestion} />
        </Stack.Navigator>
      </NavigationContainer>
    </UsuarioProvider>
  );
}
