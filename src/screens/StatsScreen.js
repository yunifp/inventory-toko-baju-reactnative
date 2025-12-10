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
        dataPoints.push(data.totalStock || 0);
      });

      if (labels.length > 0) setLineData({ labels, datasets: [{ data: dataPoints }] });

      const productsQ = query(collection(db, "products"));
      const productSnap = await getDocs(productsQ);
      let allProducts = [];
      
      const colors = ['#F43F5E', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'];
      let i = 0;

      productSnap.forEach(doc => {
        const p = doc.data();
        allProducts.push({
          name: p.name,
          population: p.stock,
          color: colors[i % colors.length],
          legendFontColor: "#475569",
          legendFontSize: 12
        });
        i++;
      });

      allProducts.sort((a, b) => b.population - a.population);
      setPieData(allProducts.slice(0, 5));
    } catch (e) { console.error(e); } 
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5"/></View>;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <LinearGradient colors={['#4F46E5', '#312E81']} style={styles.header}>
        <Text style={styles.title}>Analisis Statistik</Text>
        <Text style={styles.subtitle}>Performa gudang real-time</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, {backgroundColor: '#EEF2FF'}]}>
              <Ionicons name="pulse" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.cardTitle}>Tren Total Stok</Text>
          </View>
          
          <LineChart
            data={lineData}
            width={screenWidth - 70}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              propsForDots: { r: "5", strokeWidth: "2", stroke: "#4338CA" }
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, {backgroundColor: '#FEF2F2'}]}>
              <Ionicons name="pie-chart" size={20} color="#EF4444" />
            </View>
            <Text style={styles.cardTitle}>Top 5 Barang Terbanyak</Text>
          </View>
          
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              width={screenWidth - 70}
              height={220}
              chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"0"}
              absolute
            />
          ) : (
             <Text style={styles.noData}>Belum ada data barang</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 30, paddingBottom: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { color: '#A5B4FC', marginTop: 5 },
  content: { padding: 20, marginTop: -30 },
  chartCard: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#64748B', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { padding: 8, borderRadius: 10, marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  chart: { borderRadius: 16, paddingRight: 40 },
  noData: { textAlign: 'center', color: '#94A3B8', marginVertical: 50 }
});