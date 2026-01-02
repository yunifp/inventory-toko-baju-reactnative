import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "stock_history"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const historyList = [];
      querySnapshot.forEach((doc) => {
        historyList.push({ id: doc.id, ...doc.data() });
      });
      setHistory(historyList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.row}>
          <View style={[styles.iconContainer, { backgroundColor: item.type === 'in' ? '#DCFCE7' : '#FEE2E2' }]}>
            <Ionicons 
              name={item.type === 'in' ? "arrow-down" : "arrow-up"} 
              size={20} 
              color={item.type === 'in' ? '#166534' : '#991B1B'} 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.productName}>{item.productName}</Text>
            <Text style={styles.skuText}>{item.sku}</Text>
          </View>
        </View>
        <Text style={[styles.amountText, { color: item.type === 'in' ? '#166534' : '#991B1B' }]}>
          {item.type === 'in' ? '+' : '-'}{item.amount}
        </Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.cardFooter}>
        <View style={styles.userContainer}>
          <Ionicons name="person-circle-outline" size={16} color="#64748B" />
          <Text style={styles.footerText}>{item.userEmail || 'Unknown'}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient 
        colors={['#0F172A', '#334155']} 
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Riwayat Stok</Text>
        <Text style={styles.headerSubtitle}>Pantau pergerakan barang harian</Text>
      </LinearGradient>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#0F172A" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={history}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Belum ada riwayat transaksi.</Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 25,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 14, color: '#CBD5E1', marginTop: 5 },
  content: { flex: 1, padding: 20 },
  
  card: {
    backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { padding: 8, borderRadius: 12, marginRight: 12 },
  textContainer: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  skuText: { fontSize: 12, color: '#64748B', marginTop: 2 },
  amountText: { fontSize: 18, fontWeight: 'bold' },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userContainer: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 12, color: '#64748B', marginLeft: 4 },
  dateText: { fontSize: 12, color: '#94A3B8' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#94A3B8' }
});