import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import MissionsScreen from '../screens/MissionsScreen';
import ComicScreen from '../screens/ComicScreen';
import HomeScreen from '../screens/HomeScreen';
import CustomDrawer from '../components/CustomDrawer';
import SettingStack from './SettingStack';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import QuestionnaireStack from './QuestionnaireStack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TherapyScreen from '../screens/TherapyScreen';
import AppointmentsPage from '../screens/AppointmentScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const AppStack = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{headerShown: false}}>
      <Drawer.Screen
        name="聊天室"
        component={HomeScreen}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="心情日記"
        component={ComicScreen}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="book" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="任務"
        component={MissionsScreen}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="list" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="問卷"
        component={QuestionnaireStack}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="clipboard" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="政大預約"
        component={AppointmentsPage}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="calendar" size={22} color={color} />
          ),
        }}
      />
       <Drawer.Screen
        name="診所"
        component={TherapyScreen}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="heart" size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="設定"
        component={SettingStack}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="settings" size={22} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default AppStack;
