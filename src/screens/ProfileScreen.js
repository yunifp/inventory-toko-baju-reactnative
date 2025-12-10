import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MenuItem = ({ icon, label, onPress, color = "#4B5563", danger = false }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconBox, { backgroundColor: danger ? '#FEF2F2' : '#F3F4F6' }]}>
      <Ionicons name={icon} size={20} color={danger ? '#EF4444' : color} />
    </View>
    <Text style={[styles.menuText, { color: danger ? '#EF4444' : '#1F2937' }]}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, role, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Anda yakin ingin keluar?", [
      { text: "Batal" },
      { text: "Ya, Keluar", onPress: logout, style: 'destructive' }
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#334155']} style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarBorder}>
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${user?.email}&background=0D9488&color=fff&size=128` }} 
              style={styles.avatar} 
            />
          </View>
          <View>
            <Text style={styles.name}>{user?.email?.split('@')[0]}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{role === 'admin' ? 'Administrator' : 'Staff'}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Akun Saya</Text>
          <View style={styles.card}>
            <MenuItem icon="mail-outline" label={user?.email} />
            <MenuItem icon="shield-checkmark-outline" label={`Role: ${role}`} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferensi</Text>
          <View style={styles.card}>
            <MenuItem icon="notifications-outline" label="Notifikasi" onPress={() => {}} />
            <MenuItem icon="lock-closed-outline" label="Ganti Password" onPress={() => {}} />
            <MenuItem icon="language-outline" label="Bahasa" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <MenuItem icon="log-out-outline" label="Log Out" danger onPress={handleLogout} />
          </View>
        </View>

        <Text style={styles.version}>Versi Aplikasi 2.0.0 (Revamped)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { paddingHorizontal: 25, paddingTop: 60, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  profileInfo: { flexDirection: 'row', alignItems: 'center'},
  avatarBorder: { padding: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 40, marginRight: 20 },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  name: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  roleBadge: { backgroundColor: '#0D9488', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 5 },
  roleText: { color: 'white', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  content: { padding: 20, marginTop: 20 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748B', marginBottom: 10, marginLeft: 5, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '500' },
  version: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginBottom: 20 }
});