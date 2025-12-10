import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, Image, Dimensions, StatusBar } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../config/firebase';

const { height } = Dimensions.get('window');

export default function EditItemScreen({ route, navigation }) {
  const { item } = route.params;
  const [name, setName] = useState(item.name);
  const [sku, setSku] = useState(item.sku);
  const [imageUri, setImageUri] = useState(item.imageUrl); 
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const uploadToCloudinary = async (uri) => {
    const data = new FormData();
    data.append('file', { uri, type: 'image/jpeg', name: 'upload.jpg' });
    data.append('upload_preset', 'inventory_preset');
    data.append('cloud_name', 'dbrz19l2k');
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dbrz19l2k/image/upload', { method: 'POST', body: data });
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient 
        colors={['#F59E0B', '#D97706']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Edit Produk</Text>
            <Text style={styles.headerSubtitle}>Perbarui informasi barang</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            
            <View style={styles.imageSection}>
              <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
                <Image source={imageSource} style={styles.image} />
                <View style={styles.cameraBtn}>
                  <Ionicons name="camera" size={18} color="white" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>NAMA PRODUK</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nama Produk" placeholderTextColor="#A1A1AA"/>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>KODE SKU</Text>
              <TextInput style={styles.input} value={sku} onChangeText={setSku} placeholder="Kode SKU" placeholderTextColor="#A1A1AA"/>
            </View>

            <TouchableOpacity onPress={handleUpdate} disabled={loading} style={styles.btnShadow}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.btn}>
                {loading ? <ActivityIndicator color="white"/> : <Text style={styles.btnText}>SIMPAN PERUBAHAN</Text>}
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEB' },
  header: {
    height: height * 0.15,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 20
  },
  backBtn: {
    marginRight: 20, backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: 'white', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 14, color: '#FEF3C7', marginTop: 2 },

  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },

  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 25,
    marginTop: 50,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },

  imageSection: { alignItems: 'center', marginBottom: 25 },
  imageWrapper: { position: 'relative' },
  image: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#FEF3C7' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#D97706', padding: 8, borderRadius: 20,
    borderWidth: 3, borderColor: 'white'
  },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '800', color: '#92400E', marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A',
    borderRadius: 14, paddingHorizontal: 15, height: 50,
    fontSize: 16, color: '#451A03'
  },

  btnShadow: { marginTop: 15, shadowColor: '#D97706', shadowOffset: {width:0, height:4}, shadowOpacity:0.3, shadowRadius:5, elevation: 5 },
  btn: { borderRadius: 14, height: 55, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});