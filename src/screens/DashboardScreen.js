import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert, Image, StatusBar, Animated } from 'react-native';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, addDoc, Timestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const SummaryCard = ({ title, value, color, icon }) => (
  <LinearGradient colors={color} style={styles.summaryCard}>
    <View style={styles.summaryIconBox}>
      <Ionicons name={icon} size={22} color="white" />
    </View>
    <View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryTitle}>{title}</Text>
    </View>
  </LinearGradient>
);

export default function DashboardScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState('');
  const [stockInputs, setStockInputs] = useState({});
  const { role, user } = useAuth();
  
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
      setFilteredData(list);
    }, (error) => { console.error(error); });
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

  const handleStaffUpdateStock = async (item) => {
    const newStock = parseInt(stockInputs[item.id]);
    if (isNaN(newStock)) return Alert.alert("Error", "Angka tidak valid");
    try {
      await updateDoc(doc(db, "products", item.id), { stock: newStock });
      await addDoc(collection(db, "stock_history"), {
        type: 'update', totalStock: 0, updatedBy: item.name, date: Timestamp.now()
      });
      Alert.alert("Sukses", `Stok ${item.name} terupdate`);
      setStockInputs(prev => ({ ...prev, [item.id]: '' }));
    } catch (e) { Alert.alert("Error", e.message); }
  };

  const handleDelete = (id) => {
    Alert.alert("Hapus", "Yakin hapus barang ini?", [
      { text: "Batal" },
      { text: "Hapus", style: 'destructive', onPress: () => deleteDoc(doc(db, "products", id)) }
    ]);
  };

  const renderItem = ({ item, index }) => {
    const isLow = item.stock < 10;
    
    return (
      <Animated.View style={[styles.card, {
        transform: [{ translateY: scrollY.interpolate({ inputRange: [-1, 0, (index + 2) * 50, (index + 2) * 100], outputRange: [0, 0, 0, 50] }) }]
      }]}>
        <View style={styles.cardLeft}>
          <Image source={item.imageUrl ? { uri: item.imageUrl } : require('../../assets/placeholder.png')} style={styles.image} />
        </View>
        <View style={styles.cardCenter}>
          <Text style={styles.prodName}>{item.name}</Text>
          <Text style={styles.prodSku}>{item.sku}</Text>
          <View style={[styles.statusBadge, { backgroundColor: isLow ? '#FECACA' : '#BBF7D0' }]}>
            <Text style={[styles.statusText, { color: isLow ? '#DC2626' : '#16A34A' }]}>
              {isLow ? 'Stok Rendah' : 'Stok Tersedia'}
            </Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.stockLabel}>Sisa</Text>
          <Text style={[styles.stockNum, { color: isLow ? '#DC2626' : '#1E293B' }]}>{item.stock}</Text>
        </View>

        {role === 'staff' ? (
          <View style={styles.actionRow}>
            <TextInput 
              style={styles.inputStock} 
              placeholder="0" 
              keyboardType="numeric"
              value={stockInputs[item.id] || ''}
              onChangeText={(t) => setStockInputs(prev => ({...prev, [item.id]: t}))}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleStaffUpdateStock(item)}>
              <Ionicons name="checkmark" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.adminRow}>
            <TouchableOpacity onPress={() => navigation.navigate('EditItem', { item })} style={styles.iconBtn}>
              <Ionicons name="pencil" size={18} color="#F59E0B" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.iconBtn, {backgroundColor: '#FEF2F2'}]}>
              <Ionicons name="trash" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  const totalStock = products.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  const lowStockCount = products.filter(i => i.stock < 10).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#4F46E5', '#4338CA']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Halo, {role === 'admin' ? 'Admin' : 'Staff'}</Text>
            <Text style={styles.headerTitle}>Gudang Utama</Text>
          </View>
          
          <View style={styles.headerButtons}>
            {role === 'admin' && (
              <TouchableOpacity style={styles.statsBtn} onPress={() => navigation.navigate('Stats')}>
                <Ionicons name="stats-chart" size={20} color="#4F46E5" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profil')}>
              <Image source={{uri: 'https://ui-avatars.com/api/?name=Admin&background=random'}} style={styles.avatar} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Cari SKU atau nama barang..." 
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        <View style={styles.summaryContainer}>
          <SummaryCard title="Total Item" value={products.length} color={['#F59E0B', '#D97706']} icon="cube" />
          <SummaryCard title="Total Stok" value={totalStock} color={['#10B981', '#059669']} icon="layers" />
          <SummaryCard title="Perlu Restock" value={lowStockCount} color={['#EF4444', '#DC2626']} icon="alert-circle" />
        </View>
      </LinearGradient>

      <Animated.FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={{textAlign:'center', marginTop:50, color:'#94A3B8'}}>Data tidak ditemukan</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingTop: 60, paddingBottom: 25, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { color: '#C7D2FE', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  statsBtn: { width: 40, height: 40, backgroundColor: 'white', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  profileBtn: { padding: 2, backgroundColor: 'white', borderRadius: 25 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  searchBox: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 15, height: 50, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B' },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryCard: { width: '31%', padding: 10, borderRadius: 15, alignItems: 'center' },
  summaryIconBox: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 5, borderRadius: 8, marginBottom: 5 },
  summaryValue: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  summaryTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '600' },
  list: { padding: 20, paddingTop: 10 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 15, marginBottom: 15, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', elevation: 3, shadowColor: '#64748B', shadowOpacity: 0.1, shadowRadius: 10 },
  cardLeft: { marginRight: 15 },
  image: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#F1F5F9' },
  cardCenter: { flex: 1 },
  prodName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  prodSku: { fontSize: 12, color: '#64748B', marginBottom: 5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardRight: { alignItems: 'flex-end', minWidth: 50 },
  stockLabel: { fontSize: 10, color: '#94A3B8' },
  stockNum: { fontSize: 20, fontWeight: '800' },
  actionRow: { width: '100%', flexDirection: 'row', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  inputStock: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 15, height: 40, marginRight: 10 },
  saveBtn: { width: 40, height: 40, backgroundColor: '#4F46E5', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  adminRow: { position: 'absolute', right: 15, bottom: 15, flexDirection: 'row', gap: 10 },
  iconBtn: { width: 32, height: 32, backgroundColor: '#FEF3C7', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }
});