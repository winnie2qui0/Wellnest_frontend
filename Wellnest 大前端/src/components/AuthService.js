// AuthService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect, useContext} from 'react';

// const API_URL = 'http://192.168.1.105:8080';
//API_URL = 'http://52.68.188.15'
const API_URL = 'http://140.119.202.10:8080';

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email: email,
      password: password,
    });

    if (response.data && response.data.token) {
      console.log('Login Success:', response.data);
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('user_id', response.data.user_id.toString());
      await AsyncStorage.setItem('userEmail', response.data.email); // 保存email
      await AsyncStorage.setItem('userName', response.data.name); // 保存名字
      await AsyncStorage.setItem('userGender', response.data.gender); // 保存性別
      await AsyncStorage.setItem('userAge', response.data.age.toString()); // 保存年齡
      //顯示AsyncStorage的內容
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      console.log(result);

      return response.data; // 返回数据对象
    } else {
      // 可以处理错误情况
      return null; // 或返回特定的错误信息
    }
  } catch (error) {
    console.error('Error:', error);
    throw error; // 或处理错误
  }
};

const logout = async () => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('user_id');
  // await AsyncStorage.removeItem('userEmail');
  // await AsyncStorage.removeItem('userName');
  // await AsyncStorage.removeItem('threadId');
  // await AsyncStorage.removeItem('userGender');
  // await AsyncStorage.removeItem('userAge');
};

const isLoggedIn = async () => {
  const userToken = await AsyncStorage.getItem('userToken');
  return !!userToken;
};

export default {
  login,
  logout,
  isLoggedIn,
};
