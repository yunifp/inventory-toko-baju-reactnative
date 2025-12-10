import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const { height } = Dimensions.get('window');

export default function AddStaffScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { registerStaff } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert("Error", "Semua data wajib diisi");
    if (password.length < 6) return Alert.alert("Error", "Password minimal 6 karakter");

    setLoading(true);
    try {
      await registerStaff(email, password, name);
      Alert.alert("Sukses", "Akun Staff berhasil dibuat!", [{ text: "OK", onPress: () => {
        setName(''); setEmail(''); setPassword(''); navigation.navigate('Stok'); 
      }}]);
    } catch (error) {
      Alert.alert("Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient 
        colors={['#10B981', '#34D399']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-add" size={32} color="#065F46" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Registrasi Staff</Text>
            <Text style={styles.headerSubtitle}>Buat akun akses gudang baru</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>NAMA LENGKAP</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#10B981" style={styles.inputIcon}/>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Contoh: Budi Santoso" placeholderTextColor="#9CA3AF"/>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>EMAIL LOGIN</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#10B981" style={styles.inputIcon}/>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="staff@gudang.com" autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#9CA3AF"/>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>PASSWORD SEMENTARA</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color="#10B981" style={styles.inputIcon}/>
                <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="******" secureTextEntry placeholderTextColor="#9CA3AF"/>
              </View>
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.btnGradient}>
                {loading ? <ActivityIndicator color="white"/> : <Text style={styles.btnText}>BUAT AKUN STAFF</Text>}
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: {
    height: height * 0.28, // Header Tinggi
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  headerContent: { alignItems: 'center' },
  iconCircle: {
    width: 60, height: 60, backgroundColor: '#D1FAE5',
    borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: 'white', textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: '#ECFDF5', marginTop: 5, textAlign: 'center' },

  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },

  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 25,
    marginTop: 40, // Naik sedikit
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '800', color: '#065F46', marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 14, paddingHorizontal: 15, height: 50
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1F2937' },

  btn: { marginTop: 15, shadowColor: '#10B981', shadowOffset: {width:0, height:4}, shadowOpacity:0.3, shadowRadius:5, elevation: 5 },
  btnGradient: { borderRadius: 14, height: 55, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});