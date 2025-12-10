import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, Image, StatusBar } from 'react-native';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, addDoc, Timestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState('');
  const [stockInputs, setStockInputs] = useState({});
  const { role, user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
      setFilteredData(list);
    }, (error) => {
      if (error.code !== 'permission-denied') console.error(error);
    });
    return unsubscribe;
  }, [user]);

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = products.filter(item => 
      item.name.toLowerCase().includes(text.toLowerCase()) || 
      item.sku.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleInputChange = (id, text) => {
    setStockInputs(prev => ({ ...prev, [id]: text }));
  };

  const handleStaffUpdateStock = async (item) => {
    const newStockStr = stockInputs[item.id];
    if (!newStockStr) return;
    
    const newStock = parseInt(newStockStr);
    if (isNaN(newStock)) return Alert.alert("Error", "Masukkan angka valid");

    try {
      await updateDoc(doc(db, "products", item.id), { stock: newStock });
      
      const updatedProducts = products.map(p => 
        p.id === item.id ? { ...p, stock: newStock } : p
      );
      const totalWarehouseStock = updatedProducts.reduce((sum, p) => sum + (p.stock || 0), 0);

      await addDoc(collection(db, "stock_history"), {
        type: 'total_snapshot',
        totalStock: totalWarehouseStock,
        updatedBy: item.name,
        date: Timestamp.now()
      });

      Alert.alert("Sukses", `Stok ${item.name} diperbarui`);
      setStockInputs(prev => ({ ...prev, [item.id]: '' }));
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Hapus Barang", "Yakin ingin menghapus?", [
      { text: "Batal", style: 'cancel' },
      { text: "Hapus", style: 'destructive', onPress: () => deleteDoc(doc(db, "products", id)) }
    ]);
  };

  const renderItem = useCallback(({ item }) => {
    const imageSource = item.imageUrl 
      ? { uri: item.imageUrl } 
      : require('../../assets/placeholder.png');
    
    const isLowStock = item.stock < 10;

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Image source={imageSource} style={styles.productImage} />
          
          <View style={styles.infoContainer}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.sku}>SKU: {item.sku}</Text>
            <View style={[styles.badge, isLowStock ? styles.badgeLow : styles.badgeNormal]}>
              <Text style={styles.badgeText}>{isLowStock ? "Stok Menipis" : "Stok Aman"}</Text>
            </View>
          </View>

          <View style={styles.stockContainer}>
            <Text style={styles.stockLabel}>Sisa</Text>
            <Text style={[styles.stockValue, { color: isLowStock ? '#e74c3c' : '#2ecc71' }]}>
              {item.stock}
            </Text>
          </View>
        </View>

        {role === 'staff' ? (
          <View style={styles.staffAction}>
            <TextInput 
              style={styles.inputStock} 
              placeholder="Input Stok" 
              keyboardType="numeric"
              value={stockInputs[item.id] || ''}
              onChangeText={(text) => handleInputChange(item.id, text)}
            />
            <TouchableOpacity style={styles.updateBtn} onPress={() => handleStaffUpdateStock(item)}>
              <Ionicons name="save-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.adminAction}>
            <TouchableOpacity onPress={() => navigation.navigate('EditItem', { item })} style={styles.actionBtn}>
              <Ionicons name="create-outline" size={20} color="#f39c12" />
              <Text style={[styles.actionText, {color: '#f39c12'}]}>Edit</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              <Text style={[styles.actionText, {color: '#e74c3c'}]}>Hapus</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }, [role, stockInputs]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.header}>
        <Text style={styles.headerTitle}>Inventory Gudang</Text>
        <Text style={styles.headerSubtitle}>Total Item: {products.length}</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Cari nama atau SKU..."
            placeholderTextColor="#bbb"
            value={search}
            onChangeText={handleSearch}
          />
        </View>
        {role === 'admin' && (
          <TouchableOpacity style={styles.statsIcon} onPress={() => navigation.navigate('Stats')}>
            <Ionicons name="stats-chart" size={24} color="white" />
          </TouchableOpacity>
        )}
      </LinearGradient>
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { padding: 20, paddingTop: 50, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 5 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  headerSubtitle: { color: '#e0e0e0', fontSize: 14, marginBottom: 15 },
  searchContainer: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, alignItems: 'center', paddingHorizontal: 15, height: 45 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  statsIcon: { position: 'absolute', top: 55, right: 20 },
  listContent: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 15, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardContent: { flexDirection: 'row', marginBottom: 15 },
  productImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#eee' },
  infoContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  sku: { fontSize: 12, color: '#888', marginBottom: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  badgeLow: { backgroundColor: '#fadbd8' },
  badgeNormal: { backgroundColor: '#d5f5e3' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#555' },
  stockContainer: { alignItems: 'center', justifyContent: 'center', paddingLeft: 10 },
  stockLabel: { fontSize: 10, color: '#888' },
  stockValue: { fontSize: 20, fontWeight: 'bold' },
  staffAction: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  inputStock: { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 8, paddingHorizontal: 15, height: 40, borderWidth: 1, borderColor: '#eee', marginRight: 10 },
  updateBtn: { backgroundColor: '#3b5998', width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  adminAction: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10, justifyContent: 'space-around' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 5 },
  actionText: { marginLeft: 5, fontWeight: '600', fontSize: 14 },
  divider: { width: 1, backgroundColor: '#eee', height: '100%' }
});