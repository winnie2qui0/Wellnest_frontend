import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {COLORS, FONTS} from '../constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from '../components/TopBar';
import LinearGradient from 'react-native-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';

import {PermissionsAndroid, Platform} from 'react-native';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import axios from 'axios';

const requestGalleryPermission = async () => {
  if (Platform.OS === 'android') {
    const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    return result === RESULTS.GRANTED;
  }
  return true;
};

const EditProfile = ({navigation}) => {
  const [selectedImage, setSelectedImage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userName');
        const storedEmail = await AsyncStorage.getItem('userEmail');
        const storedGender = await AsyncStorage.getItem('userGender');
        const storedAge = await AsyncStorage.getItem('userAge');

        if (storedName) setName(storedName);
        if (storedEmail) setEmail(storedEmail);
        if (storedGender) setGender(storedGender);
        if (storedAge) setAge(storedAge);
      } catch (error) {
        console.log('Error loading data from AsyncStorage:', error);
      }
    };
    loadProfileData();
  }, []);

  const handleImageSelection = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      console.log('No permission to access gallery');
      return;
    }
    launchImageLibrary({mediaType: 'photo', quality: 1}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0].uri);
      }
    });
  };

  const handleEdit = () => {
    setEditable(true);
  };

  const handleSave = async () => {
    await AsyncStorage.setItem('userName', name);
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('userGender', gender);
    await AsyncStorage.setItem('userAge', age);

    // 将数据发送到后端保存
    try {
      const response = await axios.post(
        'http://140.119.202.10:8080/users/edit',
        {
          name: name,
          email: email,
          gender: gender,
          age: parseInt(age),
        },
      );

      if (response.status === 200) {
        console.log('Profile updated successfully');
        // 处理成功更新的逻辑
      } else {
        console.log('Failed to update profile:', response.data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }

    setEditable(false);
  };

  return (
    <LinearGradient
      colors={['#F2D0B2', '#F7C4BE']}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={{flex: 1}}>
      <SafeAreaView style={{flex: 1, paddingHorizontal: 22}}>
        <TopBar navigation={navigation} />
        <ScrollView>
          <View style={{alignItems: 'center', marginVertical: 22}}>
            <Image
              source={
                selectedImage
                  ? {uri: selectedImage}
                  : require('../assets/Images/user-profile.jpg')
              }
              style={{height: 130, width: 130, borderRadius: 85}}
            />
            <TouchableOpacity onPress={handleImageSelection}>
              <View
                style={{
                  position: 'absolute',
                  backgroundColor: 'white',
                  borderRadius: 100,
                  padding: 5,
                  bottom: 0,
                  left: 25,
                  zIndex: 9999,
                }}>
                <MaterialIcons name="photo-camera" size={20} color={'gray'} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.container}>
              <Text style={{marginTop: 10, color: 'gray'}}>全名</Text>
              <View style={styles.input}>
                <TextInput
                  value={name}
                  onChangeText={value => setName(value)}
                  editable={editable}
                />
              </View>
            </View>

            <View style={styles.container}>
              <Text style={{marginTop: 10, color: 'gray'}}>Email</Text>
              <View style={styles.input}>
                <TextInput
                  value={email}
                  onChangeText={value => setEmail(value)}
                  editable={editable}
                />
              </View>
            </View>

            <View style={styles.container}>
              <Text style={{marginTop: 10, color: 'gray'}}>性別</Text>
              <View>
                <RNPickerSelect
                  onValueChange={value => setGender(value)}
                  items={[
                    {label: '男', value: 'MALE'},
                    {label: '女', value: 'FEMALE'},
                    {label: '其他', value: 'OTHER'},
                  ]}
                  value={gender}
                  useNativeAndroidPickerStyle={false}
                  style={pickerSelectStyles}
                  disabled={!editable}
                />
              </View>
            </View>

            <View style={styles.container}>
              <Text style={{marginTop: 10, color: 'gray'}}>年齡</Text>
              <View style={styles.input}>
                <TextInput
                  value={age}
                  onChangeText={value => setAge(value)}
                  keyboardType="numeric"
                  editable={editable}
                />
              </View>
            </View>

            {editable ? (
              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>保存</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleEdit}>
                <Text style={styles.buttonText}>修改</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  form: {
    marginHorizontal: 20,
  },
  container: {
    flexDirection: 'column',
    backgroundColor: COLORS.white,
    marginBottom: 6,
    borderColor: COLORS.secondaryGray,
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 8,
    marginBottom: 30,
    borderRadius: 10,
  },
  input: {
    height: 30,
    width: '100%',
    marginVertical: 1,
    justifyContent: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  button: {
    backgroundColor: '#5B0F0F',
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...FONTS.body3,
    color: COLORS.white,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,

    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default EditProfile;
