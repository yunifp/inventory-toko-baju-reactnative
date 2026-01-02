import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { height } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, role, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Keluar", style: "destructive", onPress: () => logout() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient 
        colors={['#0F172A', '#334155']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role === 'admin' ? 'Administrator' : 'Staff Gudang'}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AKUN SAYA</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuIconBg}>
              <Ionicons name="person" size={20} color="#0F172A" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Detail Profil</Text>
              <Text style={styles.menuSubtitle}>Informasi akun anda</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LAINNYA</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={[styles.menuIconBg, styles.logoutBg]}>
              <Ionicons name="log-out" size={20} color="#EF4444" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, styles.logoutText]}>Keluar Aplikasi</Text>
              <Text style={styles.menuSubtitle}>Logout dari sesi ini</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Versi Aplikasi 1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    height: height * 0.35,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20
  },
  profileHeader: { alignItems: 'center' },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)'
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: 'white' },
  userName: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  roleText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  
  content: { flex: 1, padding: 25, },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginBottom: 15, letterSpacing: 1 },
  
  menuItem: {
    backgroundColor: 'white', flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 16, marginBottom: 12,
    shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  menuIconBg: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
  menuSubtitle: { fontSize: 12, color: '#94A3B8' },
  
  logoutBg: { backgroundColor: '#FEF2F2' },
  logoutText: { color: '#EF4444' },
  
  footer: { alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  versionText: { color: '#CBD5E1', fontSize: 12 }
});