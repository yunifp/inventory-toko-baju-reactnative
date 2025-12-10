import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';

const screenWidth = Dimensions.get("window").width;

export default function StatsScreen() {
  const [lineData, setLineData] = useState({ labels: ["-"], datasets: [{ data: [0] }] });
  const [pieData, setPieData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const historyQ = query(collection(db, "stock_history"), orderBy("date", "desc"), limit(6));
      const historySnap = await getDocs(historyQ);
      
      let labels = [];
      let dataPoints = [];
      const reversedDocs = historySnap.docs.reverse();

      reversedDocs.forEach(doc => {
        const data = doc.data();
        const date = data.date.toDate ? data.date.toDate() : new Date(data.date.seconds * 1000);
        labels.push(`${date.getHours()}:${date.getMinutes()}`);
        dataPoints.push(data.totalStock);
      });

      if (labels.length > 0) {
        setLineData({ labels, datasets: [{ data: dataPoints }] });
      }

      const productsQ = query(collection(db, "products"));
      const productSnap = await getDocs(productsQ);
      
      let allProducts = [];
      let lowStock = [];

      productSnap.forEach(doc => {
        const p = doc.data();
        allProducts.push({
          name: p.name,
          population: p.stock,
          color: getRandomColor(),
          legendFontColor: "#7F7F7F",
          legendFontSize: 12
        });
        if (p.stock < 10) lowStock.push({ name: p.name, stock: p.stock });
      });

      allProducts.sort((a, b) => b.population - a.population);
      setPieData(allProducts.slice(0, 5));
      setLowStockItems(lowStock);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    return color;
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3b5998"/></View>;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.header}>
        <Text style={styles.headerTitle}>Analisis Gudang</Text>
        <Text style={styles.headerSubtitle}>Geser ke bawah untuk refresh</Text>
      </LinearGradient>

      <View style={styles.content}>
        {lowStockItems.length > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning" size={24} color="#e74c3c" />
              <Text style={styles.alertTitle}>Stok Menipis ({lowStockItems.length})</Text>
            </View>
            {lowStockItems.map((item, index) => (
              <Text key={index} style={styles.alertItem}>• {item.name}: Sisa {item.stock}</Text>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Populasi Gudang (Realtime)</Text>
          <LineChart
            data={lineData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top 5 Barang Terbanyak</Text>
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              absolute
            />
          ) : (
             <Text style={{textAlign:'center', marginTop: 20}}>Belum ada data barang</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(37, 117, 252, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#6a11cb" }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 30, paddingBottom: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  headerSubtitle: { fontSize: 12, color: '#e0e0e0', textAlign: 'center', marginTop: 5 },
  content: { padding: 20, marginTop: -30 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 15, elevation: 3, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  chart: { borderRadius: 16, marginVertical: 8 },
  alertCard: { backgroundColor: '#fadbd8', borderRadius: 20, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#e74c3c' },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  alertTitle: { fontSize: 16, fontWeight: 'bold', color: '#c0392b', marginLeft: 10 },
  alertItem: { fontSize: 14, color: '#c0392b', marginLeft: 34, marginBottom: 2 }
});