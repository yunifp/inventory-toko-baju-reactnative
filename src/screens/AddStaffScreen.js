import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions, StatusBar, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const { height } = Dimensions.get('window');

export default function AddStaffScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const { registerStaff } = useAuth();

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "staff"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const staff = [];
      querySnapshot.forEach((doc) => {
        staff.push({ id: doc.id, ...doc.data() });
      });
      setStaffList(staff);
    });
    return () => unsubscribe();
  }, []);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      return Alert.alert('Error', 'Semua kolom harus diisi');
    }
    setLoading(true);
    try {
      await registerStaff(email, password, name);
      Alert.alert('Sukses', 'Akun staff berhasil dibuat');
      setName('');
      setEmail('');
      setPassword('');
      setShowForm(false); 
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStaffItem = ({ item }) => (
    <View style={styles.staffCard}>
      <View style={styles.staffIcon}>
        <Ionicons name="person" size={20} color="#4F46E5" />
      </View>
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{item.name}</Text>
        <Text style={styles.staffEmail}>{item.email}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Staff</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient 
        colors={['#4F46E5', '#818CF8']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Kelola Staff</Text>
            <Text style={styles.headerSubtitle}>Tambah dan lihat daftar karyawan</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.contentContainer}>
          
          {!showForm ? (
            <TouchableOpacity onPress={() => setShowForm(true)} style={styles.addBtnContainer}>
              <LinearGradient colors={['#4F46E5', '#4338CA']} style={styles.addBtn}>
                <Ionicons name="add-circle-outline" size={24} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.addBtnText}>TAMBAH STAFF BARU</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Registrasi Staff Baru</Text>
                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Ionicons name="close-circle" size={24} color="#CBD5E1" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Nama Lengkap" 
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Email" 
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Password" 
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity onPress={() => setShowForm(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>BATAL</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.submitBtnWrapper}>
                  <LinearGradient colors={['#4F46E5', '#4338CA']} style={styles.btn}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>SIMPAN</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Daftar Staff Aktif ({staffList.length})</Text>
            <FlatList
              data={staffList}
              keyExtractor={item => item.id}
              renderItem={renderStaffItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Belum ada data staff.</Text>
              }
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    height: height * 0.15,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 25,
    justifyContent: 'center',
    marginBottom: 10
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: 'white' },
  headerSubtitle: { fontSize: 14, color: '#E0E7FF', marginTop: 2 },
  
  keyboardView: { flex: 1 },
  contentContainer: { flex: 1, paddingHorizontal: 20, paddingVertical: 40},

  addBtnContainer: { marginTop: -25, marginBottom: 20, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  addBtn: { flexDirection: 'row', height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  
  formCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginTop: -30,
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12, paddingHorizontal: 12 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 45, color: '#334155' },
  
  btnRow: { flexDirection: 'row', marginTop: 10, gap: 10 },
  cancelBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  cancelBtnText: { color: '#64748B', fontWeight: 'bold' },
  submitBtnWrapper: { flex: 2 },
  btn: { borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 },

  listContainer: { flex: 1 },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 10, marginLeft: 4 },
  
  staffCard: {
    backgroundColor: 'white', flexDirection: 'row', alignItems: 'center',
    padding: 15, borderRadius: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
  },
  staffIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  staffEmail: { fontSize: 12, color: '#64748B' },
  badge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#166534' },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 20 }
});