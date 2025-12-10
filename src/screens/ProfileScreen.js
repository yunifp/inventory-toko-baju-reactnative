import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen({ navigation }) {
  const { user, role, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}}>
      <LinearGradient colors={['#2c3e50', '#4ca1af']} style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={60} color="#4ca1af" />
        </View>
        <Text style={styles.name}>{user?.email?.split('@')[0]}</Text>
        <Text style={styles.role}>{role?.toUpperCase()}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={24} color="#555" />
            <View style={styles.rowText}>
              <Text style={styles.label}>Email Address</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#555" />
            <View style={styles.rowText}>
              <Text style={styles.label}>Access Level</Text>
              <Text style={styles.value}>{role === 'admin' ? 'Administrator' : 'Staff Gudang'}</Text>
            </View>
          </View>
        </View>

        {/* {role === 'admin' && (
          <TouchableOpacity 
            style={styles.addStaffBtn} 
            onPress={() => navigation.navigate('AddStaff')}
          >
            <Ionicons name="person-add-outline" size={20} color="white" style={{marginRight: 10}} />
            <Text style={styles.addStaffText}>TAMBAH AKUN STAFF</Text>
          </TouchableOpacity>
        )} */}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
        
        <Text style={styles.version}>App Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { alignItems: 'center', paddingVertical: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5 },
  name: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  role: { fontSize: 14, color: '#e0e0e0', marginTop: 5, letterSpacing: 1 },
  content: { padding: 20, marginTop: -30 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 25, elevation: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowText: { marginLeft: 15 },
  label: { fontSize: 12, color: '#999' },
  value: { fontSize: 16, color: '#333', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15 },
  addStaffBtn: { backgroundColor: '#11998e', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 20, flexDirection: 'row', justifyContent: 'center', elevation: 3 },
  addStaffText: { color: 'white', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },
  logoutBtn: { backgroundColor: '#ff4757', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 15, shadowColor: '#ff4757', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, elevation: 5 },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  version: { textAlign: 'center', marginTop: 30, color: '#ccc', fontSize: 12 }
});