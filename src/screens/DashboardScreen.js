import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const [powerData, setPowerData] = useState(null);
  const [latestReading, setLatestReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [relayStatus, setRelayStatus] = useState('on'); // 'on' or 'off'

  // Mock user data - in a real app, this would come from authentication context
  const user = {
    meterNumber: '12345678',
    fullName: 'John Doe'
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch current power data
      const powerResponse = await ApiService.getCurrentPower(user.meterNumber);
      setPowerData(powerResponse);
      
      // Fetch latest reading
      const readingResponse = await ApiService.getLatestReading(user.meterNumber);
      setLatestReading(readingResponse);
      
    } catch (error) {
      console.error('Error loading dashboard data', error);
      Alert.alert(
        'Error', 
        'Failed to load dashboard data. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const toggleRelay = async () => {
    try {
      setLoading(true);
      const newStatus = relayStatus === 'on' ? 'off' : 'on';
      
      await ApiService.controlRelay({
        meter_number: user.meterNumber,
        status: newStatus
      });
      
      setRelayStatus(newStatus);
      Alert.alert(
        'Success', 
        `Relay turned ${newStatus.toUpperCase()}`
      );
      
      // Refresh data after toggling relay
      loadDashboardData();
    } catch (error) {
      console.error('Error toggling relay', error);
      Alert.alert(
        'Error', 
        'Failed to toggle relay. Please try again.'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Set up interval to refresh data every minute
    const interval = setInterval(() => {
      loadDashboardData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && !refreshing && !powerData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007bff']}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user.fullName}</Text>
        <Text style={styles.meterNumber}>Meter: {user.meterNumber}</Text>
      </View>

      <View style={styles.powerStatusCard}>
        <Text style={styles.cardTitle}>Power Status</Text>
        <View style={styles.powerStatusContent}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: relayStatus === 'on' ? '#4CAF50' : '#F44336' }]} />
            <Text style={styles.statusText}>{relayStatus === 'on' ? 'Connected' : 'Disconnected'}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggleButton, { backgroundColor: relayStatus === 'on' ? '#F44336' : '#4CAF50' }]}
            onPress={toggleRelay}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.toggleButtonText}>
                {relayStatus === 'on' ? 'Disconnect' : 'Connect'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Power</Text>
        <View style={styles.powerInfo}>
          <Ionicons name="flash" size={40} color="#FFC107" />
          <Text style={styles.powerValue}>
            {powerData?.current_power || '0'} <Text style={styles.powerUnit}>kWh</Text>
          </Text>
        </View>
        <View style={styles.powerDetails}>
          <View style={styles.powerDetailItem}>
            <Text style={styles.powerDetailLabel}>Total Allocated</Text>
            <Text style={styles.powerDetailValue}>{powerData?.total_allocated || '0'} kWh</Text>
          </View>
          <View style={styles.powerDetailItem}>
            <Text style={styles.powerDetailLabel}>Total Consumed</Text>
            <Text style={styles.powerDetailValue}>{powerData?.total_consumed || '0'} kWh</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Latest Reading</Text>
        {latestReading ? (
          <View style={styles.readingInfo}>
            <View style={styles.readingItem}>
              <Text style={styles.readingLabel}>Timestamp</Text>
              <Text style={styles.readingValue}>{new Date(latestReading.timestamp).toLocaleString()}</Text>
            </View>
            <View style={styles.readingItem}>
              <Text style={styles.readingLabel}>Consumption</Text>
              <Text style={styles.readingValue}>{latestReading.consumption} kWh</Text>
            </View>
            <View style={styles.readingItem}>
              <Text style={styles.readingLabel}>Voltage</Text>
              <Text style={styles.readingValue}>{latestReading.voltage} V</Text>
            </View>
            <View style={styles.readingItem}>
              <Text style={styles.readingLabel}>Current</Text>
              <Text style={styles.readingValue}>{latestReading.current} A</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>No reading data available</Text>
        )}
      </View>

      <TouchableOpacity 
        style={styles.reportButton}
        onPress={() => navigation.navigate('PortReport')}
      >
        <Ionicons name="document-text-outline" size={20} color="#fff" />
        <Text style={styles.reportButtonText}>View Port Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
    fontSize: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#007bff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  meterNumber: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  powerStatusCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 15,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  powerStatusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  powerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  powerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  powerUnit: {
    fontSize: 18,
    color: '#666',
  },
  powerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  powerDetailItem: {
    flex: 1,
  },
  powerDetailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  powerDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  readingInfo: {
    marginTop: 5,
  },
  readingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  readingLabel: {
    fontSize: 14,
    color: '#666',
  },
  readingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 15,
  },
  reportButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    margin: 15,
    marginTop: 5,
  },
  reportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default DashboardScreen;