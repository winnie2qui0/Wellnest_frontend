import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import CheckBox from '@react-native-community/checkbox';
import TopBar from '../components/TopBar';
import Icon from 'react-native-vector-icons/Ionicons';

const TherapyScreen = ({ navigation }) => {
    const [location, setLocation] = useState(null);
    const [clinics, setClinics] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [consentOptions, setConsentOptions] = useState({
      basicInfo: false,
      phone: false,
      conversation: false,
    });

    useEffect(() => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }, []);

    const fetchClinics = () => {
      if (location) {
        fetch('http://140.119.202.10:8080/location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            setClinics(data);  // 存儲返回的診所資料
          })
          .catch((error) => {
            console.error('Error fetching clinics:', error);
          });
      }
    };

    const handleAppointment = (clinic) => {
      setSelectedClinic(clinic);
      setModalVisible(true);  // 顯示彈出視窗
    };

    const submitConsent = () => {
      setModalVisible(false);
      Alert.alert("通知", "已將資料傳送給診所，請靜待診所回覆");
    };

    const renderClinicItem = ({ item }) => (
      <View style={styles.clinicItem}>
        <View style={styles.buttonWrapper}>
            <Text style={styles.clinicName}>{item.name}</Text>
            {/* <TouchableOpacity style={styles.appointmentButton} onPress={() => handleAppointment(item)}>
                <Icon name="checkmark-circle-outline" size={22} color={'white'} />
                <Text style={styles.buttonText}>預約</Text>
            </TouchableOpacity> */}
        </View>
            <Icon name="location-outline" size={22}  style={styles.clinicDetails}>  {item.phone}</Icon>
            <Icon name="call-outline" size={22} style={styles.clinicDetails}>  {item.location}</Icon>
            <Icon name="walk-outline" size={22} style={styles.clinicDetails}>  {item.distance}</Icon>
      
      </View>
    );

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>附近的心理治療所</Text>
        <TouchableOpacity style={styles.button} onPress={fetchClinics}>
            <Icon  name="search-outline" size={22} color={'white'} /> 
            <Text style={styles.buttonText}>搜尋 </Text> 
        </TouchableOpacity>
        <FlatList
          data={clinics}
          renderItem={renderClinicItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.list}
        />

        {/* Modal for consent options */}
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>請勾選同意提供的資料</Text>
              <View style={styles.checkboxContainer}>
                <CheckBox
                  value={consentOptions.basicInfo}
                  onValueChange={(newValue) =>
                    setConsentOptions({ ...consentOptions, basicInfo: newValue })
                  }
                />
                <Text style={styles.checkboxLabel}>基本資料</Text>
              </View>
              <View style={styles.checkboxContainer}>
                <CheckBox
                  value={consentOptions.phone}
                  onValueChange={(newValue) =>
                    setConsentOptions({ ...consentOptions, phone: newValue })
                  }
                />
                <Text style={styles.checkboxLabel}>電話</Text>
              </View>
              <View style={styles.checkboxContainer}>
                <CheckBox
                  value={consentOptions.conversation}
                  onValueChange={(newValue) =>
                    setConsentOptions({ ...consentOptions, conversation: newValue })
                  }
                />
                <Text style={styles.checkboxLabel}>對話紀錄</Text>
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={submitConsent}>
                <Text style={styles.submitButtonText}>送出</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBDC',
    justifyContent:'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
    textAlign: 'center',
  },
  button: {
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
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    
  },
  list: {
    marginHorizontal:20,
  },
  clinicItem: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
   
    justifyContent:'center',
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    width:'80%'
  },
  buttonWrapper:{
    margin:10,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
  },
  clinicDetails: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    flexWrap:'wrap',
  },
  clinicDistance: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  appointmentButton: {
    flexDirection:'row',
    backgroundColor: '#A9CAB2',
    borderRadius: 15,
    justifyContent:'center',
    alignItems: 'center',
    height:'auto',
    width:"25%",
    padding:5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent:'flex-start',
 
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
   
    
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TherapyScreen;