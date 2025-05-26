import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import axios from 'axios';

import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import TopBar from '../components/TopBar';
import RNPickerSelect from 'react-native-picker-select';

const RegisterScreen = ({navigation}) => {
  const [gender, setGender] = useState(''); // 性别状态
  const [age, setAge] = useState(''); // 年龄状态
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [isEmailEmpty, setIsEmailEmpty] = useState(false);
  const [isNicknameEmpty, setIsNicknameEmpty] = useState(false);

  useEffect(() => {
    setIsPasswordMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  const checkPasswordMatch = () => {
    setIsPasswordMatch(password === confirmPassword);
  };

  const registration = () => {
    console.log('Email:', email);
    console.log('Nickname:', nickname);
    console.log('Password:', password);
    console.log('Confirm Password:', confirmPassword);
    console.log('Gender:', gender);
    console.log('Age:', age);

    if (email && nickname && password && confirmPassword && gender && age) {
      axios
        .post('http://140.119.202.10:8080/users/register', {
          email: email,
          password: password,
          name: nickname,
          gender: gender,
          age: parseInt(age), // 确保年龄为整数
        })
        .then(response => {
          console.log('Success:', response.data);
          if (response.status === 201) {
            navigation.navigate('Login'); // 注册成功后导航到登录页面
          } else {
            console.log('Registration error:', response.data);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    } else {
      // 显示错误消息
      if (!email) setIsEmailEmpty(true);
      if (!nickname) setIsNicknameEmpty(true);
      if (!password) setIsPasswordMatch(true);
    }
  };

  return (
    <View
      style={{backgroundColor: '#EDEBDC', flex: 1, justifyContent: 'center'}}>
      <SafeAreaView style={{flex: 1}}>
        <TopBar navigation={navigation} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{flex: 1, paddingHorizontal: 30, flexDirection: 'column'}}>
          <Text
            style={{
              fontFamily: 'Roboto-Medium',
              fontSize: 36,
              fontWeight: '400',
              color: '#80351E',
              marginTop: 100,
              marginBottom: 30,
            }}>
            註冊
          </Text>
          <InputField
            label={'電子郵件'}
            keyboardType="email-address"
            onChangeText={text => {
              setEmail(text);
              setIsEmailEmpty(!text);
            }}
          />
          {isEmailEmpty && (
            <Text style={styles.errorText}>電子郵件不能為空</Text>
          )}
          <InputField
            label={'暱稱'}
            onChangeText={text => {
              setNickname(text);
              setIsNicknameEmpty(!text);
            }}
          />
          {isNicknameEmpty && (
            <Text style={styles.errorText}>暱稱不能為空</Text>
          )}
          <View style={styles.container}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>性別</Text>
            </View>
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={value => setGender(value)}
                items={[
                  {label: '男', value: 'MALE'},
                  {label: '女', value: 'FEMALE'},
                  {label: '其他', value: 'OTHER'},
                ]}
              />
            </View>
          </View>
          <InputField
            label={'年齡'}
            keyboardType="numeric"
            onChangeText={text => setAge(text)}
          />
          <InputField
            label={'密碼'}
            inputType="password"
            onChangeText={text => {
              setPassword(text);
              checkPasswordMatch();
            }}
          />
          <InputField
            label={'確認密碼'}
            inputType="password"
            onChangeText={text => {
              setConfirmPassword(text);
              checkPasswordMatch();
            }}
          />
          {!isPasswordMatch && <Text style={styles.errorText}>密碼不相同</Text>}
          <CustomButton label={'註冊'} onPress={registration} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 30,
            }}>
            <Text>已經註冊？</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{color: '#80351E', fontWeight: '700'}}> 登入</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    fontSize: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#B65A3D',
    padding: 5,
    marginBottom: 25,
    height: 45,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: 'gray',
  },
  pickerContainer: {
    flex: 8,
    textAlignVertical: 'center',
  },
});

export default RegisterScreen;
