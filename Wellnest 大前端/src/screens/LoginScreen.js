import React, {useState, useEffect, useContext} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import Icon from 'react-native-vector-icons/AntDesign';
import TopBar from '../components/TopBar';
import AuthService from '../components/AuthService';
import {AuthContext} from '../components/AuthContext';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {setIsUserLoggedIn} = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const data = await AuthService.login(email, password);
      if (data.token) {
        // 登录成功
        setIsUserLoggedIn(true);
        navigation.navigate('AppStack');
      } else {
        // 显示错误消息
        Alert.alert('登入失敗', '提供的電子郵件或密碼不正確。');
      }
    } catch (error) {
      console.error('登入失敗', error);
      Alert.alert('登入失敗', '提供的電子郵件或密碼不正確。');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#EDEBDC',
      }}>
      <SafeAreaView
        style={{
          flex: 1,
          flexDirection: 'column',
        }}>
        <TopBar navigation={navigation} />

        <View style={{paddingHorizontal: 30}}>
          <Text
            style={{
              fontFamily: 'Roboto-Medium',
              fontSize: 36,
              fontWeight: '400',
              color: '#80351E',

              marginTop: 100,
              marginBottom: 30,
            }}>
            登入
          </Text>

          <InputField
            label={'電子郵件'}
            keyboardType="email-address"
            onChangeText={text => {
              setEmail(text);
              console.log(text);
            }}
          />

          <InputField
            label={'密碼'}
            inputType="password"
            fieldButtonLabel={'Forgot?'}
            fieldButtonFunction={() => {}}
            onChangeText={text => {
              setPassword(text);
              console.log(text);
            }}
          />
          <CustomButton label={'登入'} onPress={handleLogin} />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;
