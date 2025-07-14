import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';

const PortReportScreen = ({ navigation }) => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock user data - in a real app, this would come from authentication context
  const user = {
    meterNumber: '12345678',
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      const response = await ApiService.getPortReport(user.meterNumber);
      setReportData(Array.isArray(response) ? response : []);
      
    } catch (error) {
      console.error('Error loading port report', error);
      Alert.alert(
        'Error', 
        'Failed to load port report. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReportData();
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const renderReportItem = ({ item, index }) => {
    return (
      <View style={styles.reportItem}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportDate}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
          <Text style={styles.reportTime}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        
        <View style={styles.reportDetails}>
          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Consumption</Text>
            <Text style={styles.reportValue}>{item.consumption} kWh</Text>
          </View>
          
          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Voltage</Text>
            <Text style={styles.reportValue}>{item.voltage} V</Text>
          </View>
          
          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Current</Text>
            <Text style={styles.reportValue}>{item.current} A</Text>
          </View>
          
          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Power Factor</Text>
            <Text style={styles.reportValue}>{item.power_factor || 'N/A'}</Text>
          </View>
          
          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Status</Text>
            <View style={styles.statusContainer}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: item.status === 'on' ? '#4CAF50' : '#F44336' }
                ]} 
              />
              <Text style={styles.statusText}>
                {item.status === 'on' ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyList = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>No port report data available</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Port Report</Text>
        <Text style={styles.subtitle}>Meter: {user.meterNumber}</Text>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading report data...</Text>
        </View>
      ) : (
        <FlatList
          data={reportData}
          renderItem={renderReportItem}
          keyExtractor={(item, index) => `report-${index}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007bff']}
            />
          }
        />
      )}
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color="#fff" />
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#007bff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80, // Extra padding for the back button
  },
  reportItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reportDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reportTime: {
    fontSize: 14,
    color: '#666',
  },
  reportDetails: {
    padding: 15,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reportLabel: {
    fontSize: 14,
    color: '#666',
  },
  reportValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007bff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default PortReportScreen;