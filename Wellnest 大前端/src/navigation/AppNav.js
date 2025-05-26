import React, { Component } from 'react'
import { Text, View ,StyleSheet} from 'react-native'

import {NavigationContainer} from '@react-navigation/native';


import AuthStack from './AuthStack';
import AppStack from './AppStack';

export class AppNav extends Component {
  render() {
    return (
    <NavigationContainer  style={styles.container}>
        <AuthStack />
        {/* <AppStack />   */}
      
    </NavigationContainer>
    )
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1, // Takes the whole screen
      Color: '#EDEBDC', // Replace with your desired background color
      alignItems: 'center',
      justifyContent: 'center',
    },
  
  });

export default AppNav
