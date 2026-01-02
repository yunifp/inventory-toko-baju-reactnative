import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, ActivityIndicator, Text, KeyboardAvoidingView, Platform, Dimensions, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../config/firebase';

const { height } = Dimensions.get('window');

export default function AddItemScreen({ navigation }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const uploadToCloudinary = async (uri) => {
    if (!uri) return null;
    const data = new FormData();
    data.append('file', { uri, type: 'image/jpeg', name: 'upload.jpg' });
    data.append('upload_preset', 'inventory_preset');
    data.append('cloud_name', 'dbrz19l2k');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dbrz19l2k/image/upload', {
        method: 'POST', body: data
      });
      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      return null;
    }
  };

  const handleSave = async () => {
    if (!name || !sku) return Alert.alert("Peringatan", "Nama dan SKU harus diisi");
    setLoading(true);
    try {
      let publicImageUrl = null;
      if (imageUri) publicImageUrl = await uploadToCloudinary(imageUri);

      const docRef = await addDoc(collection(db, "products"), {
        name, sku, stock: 0, imageUrl: publicImageUrl, createdAt: new Date()
      });

      await addDoc(collection(db, "stock_history"), {
        productId: docRef.id,
        productName: name,
        sku: sku,
        amount: 0,
        type: 'in',
        userEmail: auth.currentUser?.email,
        createdAt: new Date(),
        note: 'Barang baru ditambahkan'
      });

      Alert.alert("Sukses", "Barang ditambahkan");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Tambah Barang</Text>
            <Text style={styles.headerSubtitle}>Input data produk baru</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>FOTO PRODUK</Text>
              <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {imageUri ? (
                  <>
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    <View style={styles.editIconBadge}>
                      <Ionicons name="pencil" size={16} color="white" />
                    </View>
                  </>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="cloud-upload-outline" size={40} color="#6366F1" />
                    <Text style={styles.uploadText}>Upload Foto</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>NAMA BARANG</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Contoh: Kemeja Flanel" 
                placeholderTextColor="#94A3B8"
                value={name} onChangeText={setName} 
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>KODE SKU (UNIK)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Contoh: FL-001" 
                placeholderTextColor="#94A3B8"
                value={sku} onChangeText={setSku}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
              <LinearGradient
                colors={['#4F46E5', '#4338CA']}
                style={styles.btnGradient}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>SIMPAN DATA</Text>}
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    height: height * 0.15,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    marginRight: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: 'white', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 14, color: '#E0E7FF', marginTop: 2 },
  
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 25,
    marginTop: 50,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  
  section: { alignItems: 'center', marginBottom: 25 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 15, letterSpacing: 1 },
  imagePicker: { position: 'relative' },
  imagePreview: { width: 120, height: 120, borderRadius: 20, backgroundColor: '#F1F5F9' },
  imagePlaceholder: { 
    width: 120, height: 120, borderRadius: 20, backgroundColor: '#F8FAFC', 
    borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center' 
  },
  uploadText: { marginTop: 8, fontSize: 12, color: '#6366F1', fontWeight: '600' },
  editIconBadge: {
    position: 'absolute', bottom: -5, right: -5,
    backgroundColor: '#4F46E5', padding: 8, borderRadius: 20,
    borderWidth: 3, borderColor: 'white'
  },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '800', color: '#334155', marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 16, height: 50,
    fontSize: 16, color: '#1E293B'
  },

  btn: { marginTop: 10, shadowColor: '#4F46E5', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnGradient: { borderRadius: 14, height: 55, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});