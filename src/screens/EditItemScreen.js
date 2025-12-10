import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, Image } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../config/firebase';

export default function EditItemScreen({ route, navigation }) {
  const { item } = route.params;
  const [name, setName] = useState(item.name);
  const [sku, setSku] = useState(item.sku);
  const [imageUri, setImageUri] = useState(item.imageUrl); 
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
    } catch (error) { return null; }
  };

  const handleUpdate = async () => {
    if (!name || !sku) return Alert.alert("Error", "Wajib diisi");
    setLoading(true);
    try {
      const docRef = doc(db, "products", item.id);
      let finalImageUrl = item.imageUrl;
      if (imageUri !== item.imageUrl) {
        const uploaded = await uploadToCloudinary(imageUri);
        if (uploaded) finalImageUrl = uploaded;
      }
      await updateDoc(docRef, { name, sku, imageUrl: finalImageUrl });
      Alert.alert("Sukses", "Data diperbarui");
      navigation.goBack();
    } catch (e) { Alert.alert("Error", e.message); } 
    finally { setLoading(false); }
  };

  const imageSource = imageUri ? { uri: imageUri } : require('../../assets/placeholder.png');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.mainContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <LinearGradient colors={['#f39c12', '#d35400']} style={styles.header}>
          <Text style={styles.headerTitle}>Edit Barang</Text>
        </LinearGradient>

        <View style={styles.container}>
          <View style={styles.card}>
            <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
              <Image source={imageSource} style={styles.image} />
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>

            <Text style={styles.label}>Detail Barang</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Nama Produk</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Kode SKU</Text>
              <TextInput style={styles.input} value={sku} onChangeText={setSku} />
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleUpdate} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>SIMPAN PERUBAHAN</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCancel} onPress={() => navigation.goBack()} disabled={loading}>
              <Text style={styles.btnCancelText}>BATAL</Text>
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
  header: { padding: 20, paddingTop: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, height: 140 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  container: { padding: 20, marginTop: -60 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 25, elevation: 4 },
  imageWrapper: { alignSelf: 'center', marginBottom: 25 },
  image: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#f39c12' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#d35400', padding: 8, borderRadius: 20 },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  inputBox: { marginBottom: 15 },
  inputLabel: { fontSize: 12, color: '#888', marginBottom: 5, marginLeft: 5 },
  input: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee', fontSize: 16 },
  btn: { backgroundColor: '#f39c12', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, shadowColor: '#f39c12', elevation: 4 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  btnCancel: { padding: 15, alignItems: 'center', marginTop: 5 },
  btnCancelText: { color: '#888', fontWeight: '600' }
});