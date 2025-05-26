import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://140.119.202.10:8080';
  // Fetch appointment data from /appointment API
  const fetchAppointments = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User is not authenticated');
      }

      setLoading(true);
      setError(null); // 清除上一次的錯誤

      const response = await fetch(`${API_URL}/appointment`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.length === 0) {
        console.log('No appointments found.');
      }

      setAppointments(data); // 更新預約數據
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    // 假設 appointments 是一個包含日期、狀態和剩餘名額的陣列
    return appointments.slice(0, 14).map((item, index) => (

      <View key={index} style={styles.dayCell}>
        <Text style={styles.dateText}>{item.date}</Text>
        <View style={styles.statusCell}>
          <Text style={styles.statusText}>{item.status}</Text>
          <Text style={styles.remainingText}>
            {item.remaining !== null ? `剩餘 ${item.remaining}` : ''}
          </Text>
        </View>
        
      </View>
    ));
  };

  // 初次加載時獲取數據
  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.header}>政大初步晤談預約</Text>

        <TouchableOpacity style={styles.refreshButton} onPress={fetchAppointments} disabled={loading}>
        {loading ? (
            <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.refreshButtonText} >刷新</Text>
        )}
        </TouchableOpacity>

        

        {error && <Text style={styles.error}>{error}</Text>}
        
       <View style={styles.Container}>
        <View style={styles.weekHeader}>
            {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
              <Text key={index} style={styles.weekHeaderText}>{day}</Text>
            ))}
        </View>
        <View style={styles.calendarContainer}>
          {renderCalendar()}
        </View>
       </View>
         
        
    </SafeAreaView>
  );
};

// Basic styling for the page, table, and refresh button in React Native
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    alignItems: 'center',
    justifyContent:'flex-start',
    paddingHorizontal:20,
    paddingVertical:10,
    backgroundColor: '#EDEBDC',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
  },
  refreshButton: {
    backgroundColor:'#E3B7AA',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    justifyContent:'center',
    flexDirection:'row',
    width:'40%',
    alignSelf:'center',
  },
  refreshButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
  Container:{
    flexDirection: 'column',
    alignContent:'center',
    alignItems:'center',
    justifyContent: 'center',
    width: '108%',
    height:'35%',
    paddingVertical:10,
    marginTop:100,
    borderRadius:10,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent:'center',
    width: '90%',
  },
  weekHeaderText:{
    textAlign:'center',
  },
  calendarContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal:0.9,
    
  },
  dayCell: {
    width: '13.5%', // 為了每行容納7天，適應屏幕
    marginVertical: 5,
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal:1,
  },
  dateText: {
    fontSize:10,
    fontWeight: 'bold',
    color: '#333',
    textAlign:'center',
  },
  statusCell:{
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  remainingText: {
    fontSize: 12,
    color: '#007BFF',
    marginTop: 5,
  },
});

export default AppointmentsPage;