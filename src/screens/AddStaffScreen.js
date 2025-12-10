import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function AddStaffScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { registerStaff } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Semua data wajib diisi");
      return;
    }
    if (password.length < 6) {
        Alert.alert("Error", "Password minimal 6 karakter");
        return;
    }

    setLoading(true);
    try {
      await registerStaff(email, password, name);
      
      Alert.alert("Berhasil", "Akun Staff berhasil dibuat!", [
        { text: "OK", onPress: () => {
            setName(''); setEmail(''); setPassword('');
            navigation.navigate('Stok'); 
        }}
      ]);
    } catch (error) {
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') msg = "Email sudah digunakan orang lain";
      Alert.alert("Gagal", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.header}>
          <Text style={styles.headerTitle}>Registrasi Karyawan</Text>
        </LinearGradient>

        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconWrapper}>
              <Ionicons name="person-add" size={40} color="#11998e" />
            </View>

            <Text style={styles.label}>Nama Karyawan</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={20} color="#888" style={{marginRight: 10}}/>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nama Lengkap"/>
            </View>

            <Text style={styles.label}>Email Login</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color="#888" style={{marginRight: 10}}/>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="staff@toko.com" autoCapitalize="none"/>
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={{marginRight: 10}}/>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="******"/>
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="white"/> : <Text style={styles.btnText}>SIMPAN DATA STAFF</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f5f7fa' },
  scrollContent: { flexGrow: 1 },
  header: { padding: 30, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  container: { padding: 20, marginTop: -40 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 25, elevation: 5 },
  iconWrapper: { alignSelf: 'center', backgroundColor: '#e0f2f1', padding: 15, borderRadius: 50, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 5, marginTop: 10 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 10, paddingHorizontal: 10, height: 50 },
  input: { flex: 1, fontSize: 16 },
  btn: { backgroundColor: '#11998e', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});