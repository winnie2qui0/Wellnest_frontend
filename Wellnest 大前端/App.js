import React from 'react';
import {StyleSheet} from 'react-native';

import {AuthProvider} from './src/components/AuthContext'; // adjust the path as needed
import AppNav from './src/navigation/AppNav';
import SettingStack from './src/navigation/SettingStack';

function App() {
  return (
    <AuthProvider>
      <AppNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes the whole screen
    Color: '#EDEBDC', // Replace with your desired background color
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
