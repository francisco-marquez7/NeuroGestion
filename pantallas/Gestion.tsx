// PantallaGestion.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUsuario } from '../context/UsuarioContext';
import { getEmpresas, getUsuarios, addEmpresa, updateEmpresa, deleteEmpresa, addUsuario, updateUsuario, deleteUsuario } from '../firebase/firestoreService';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';

export default function Gestion({ navigation }: any) {
  const { usuario } = useUsuario();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);

  useEffect(() => {
    if (usuario?.rol !== 'admin') {
      navigation.navigate('Home');
    } else {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    const usuariosData = await getUsuarios();
    const empresasData = await getEmpresas();
    setUsuarios(usuariosData);
    setEmpresas(empresasData);
  };

  const usuariosPorEmpresa = useMemo(() => {
    const counts: any = {};
    empresas.forEach((e) => (counts[e.id] = 0));
    usuarios.forEach((u) => {
      if (counts[u.empresaId]) counts[u.empresaId]++;
    });
    return Object.entries(counts).map(([id, count]) => {
      const empresa = empresas.find((e) => e.id === id);
      return { nombre: empresa?.nombreEmpresa || 'Desconocida', usuarios: count };
    });
  }, [usuarios, empresas]);

  const usuariosPorMes = useMemo(() => {
    const meses: any = {};
    usuarios.forEach((u) => {
      const fecha = u.fechaAlta?.toDate?.() || new Date();
      const clave = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
      meses[clave] = (meses[clave] || 0) + 1;
    });
    return Object.entries(meses).map(([mes, total]) => ({ mes, total }));
  }, [usuarios]);

  const activosVsInactivos = useMemo(() => {
    let activos = 0;
    let inactivos = 0;
    usuarios.forEach((u) => (u.estado === 'Activo' ? activos++ : inactivos++));
    return [
      { name: 'Activos', value: activos },
      { name: 'Inactivos', value: inactivos },
    ];
  }, [usuarios]);

  const topEmpresas = useMemo(() => {
    const counts: any = {};
    usuarios.forEach((u) => {
      counts[u.empresaId] = (counts[u.empresaId] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([id, total]) => {
        const nombre = empresas.find((e) => e.id === id)?.nombreEmpresa || 'Desconocida';
        return { nombre, total };
      })
      .sort((a, b) => Number(b.total) - Number(a.total))
      .slice(0, 5);
  }, [usuarios, empresas]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navItem}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
          <Text style={styles.navText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Gestión</Text>
        <View style={styles.navItem} />
      </View>

      <Text style={styles.sectionTitle}>Usuarios por empresa</Text>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart layout="vertical" data={usuariosPorEmpresa}>
          <XAxis type="number" />
          <YAxis type="category" dataKey="nombre" />
          <Tooltip />
          <Bar dataKey="usuarios" fill="#2b7a78" />
        </BarChart>
      </ResponsiveContainer>

      <Text style={styles.sectionTitle}>Nuevos usuarios por mes</Text>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={usuariosPorMes}>
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total" stroke="#2b7a78" />
        </LineChart>
      </ResponsiveContainer>

      <Text style={styles.sectionTitle}>Usuarios activos vs inactivos</Text>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={activosVsInactivos} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60}>
            <Cell fill="#27ae60" />
            <Cell fill="#c0392b" />
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <Text style={styles.sectionTitle}>Top 5 empresas con más usuarios</Text>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topEmpresas}>
          <XAxis dataKey="nombre" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#2b7a78" />
        </BarChart>
      </ResponsiveContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  inner: {
    padding: 20,
  },
  navbar: {
    height: 60,
    backgroundColor: '#2b7a78',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  navItem: { flexDirection: 'row', alignItems: 'center' },
  navText: { color: '#fff', fontSize: 16, marginLeft: 6 },
  navTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2b7a78',
    marginTop: 20,
    marginBottom: 10,
  },
});
