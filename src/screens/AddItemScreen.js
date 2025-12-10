import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, ActivityIndicator, Text, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../config/firebase';

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

      await addDoc(collection(db, "products"), {
        name, sku, stock: 0, imageUrl: publicImageUrl, createdAt: new Date()
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.mainContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <LinearGradient colors={['#4c669f', '#3b5998']} style={styles.header}>
          <Text style={styles.headerTitle}>Tambah Barang Baru</Text>
        </LinearGradient>

        <View style={styles.container}>
          <View style={styles.card}>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color="#3b5998" />
                  <Text style={styles.imageText}>Upload Foto Produk</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Informasi Produk</Text>
            
            <View style={styles.inputGroup}>
              <Ionicons name="cube-outline" size={20} color="#888" style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Nama Produk (Misal: Kopi)" 
                value={name} onChangeText={setName} 
              />
            </View>

            <View style={styles.inputGroup}>
              <Ionicons name="barcode-outline" size={20} color="#888" style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Kode SKU (Misal: KOPI-001)" 
                value={sku} onChangeText={setSku} 
              />
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>SIMPAN DATA</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f5f7fa' },
  scrollViewContent: { flexGrow: 1 },
  header: { padding: 20, paddingTop: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, height: 150 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  container: { padding: 20, marginTop: -60 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 25, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  imagePicker: { alignSelf: 'center', marginBottom: 25 },
  imagePreview: { width: 150, height: 150, borderRadius: 15 },
  imagePlaceholder: { width: 150, height: 150, borderRadius: 15, backgroundColor: '#f0f4f8', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#3b5998' },
  imageText: { color: '#3b5998', marginTop: 10, fontSize: 12, fontWeight: '600' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#eee', height: 50 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  btn: { backgroundColor: '#3b5998', borderRadius: 10, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#3b5998', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});