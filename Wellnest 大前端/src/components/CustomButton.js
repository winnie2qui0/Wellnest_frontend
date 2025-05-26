import {Text, TouchableOpacity} from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

export default function CustomButton({label, onPress}) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
       onPress={onPress}
      
      style={{
        backgroundColor: '#80351E',
        borderRadius: 6, 
        border: '2px #80351E solid',
        padding: 20,
        // marginTop:360,
        marginBottom: 30,
      }}>
      <Text
        style={{
            color: 'white',
            fontSize: 15,
            fontFamily: 'Roboto',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: 0.60,
        }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}