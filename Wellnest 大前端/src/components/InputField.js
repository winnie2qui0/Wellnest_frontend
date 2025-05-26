import React from 'react';
import {View, Text, TouchableOpacity, TextInput} from 'react-native';
import {Picker} from '@react-native-picker/picker';

export default function InputField({
  label,
  icon,
  inputType,
  keyboardType,
  fieldButtonLabel,
  fieldButtonFunction,
  onChangeText, // 添加这行
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#B65A3D',
        padding: 5,
        marginBottom: 25,
        alignItems: 'center',
      }}>
      {inputType === 'password' ? (
        <TextInput
          placeholder={label}
          placeholderTextColor="gray" 
          keyboardType={keyboardType}
          style={{
            flex: 1,
            height: 30,
            textAlignVertical: 'center',
          }}
          secureTextEntry={true}
          onChangeText={onChangeText} // 使用传入的onChangeText
        />
      ) : (
        <TextInput
          placeholder={label}
          placeholderTextColor="gray" 
          keyboardType={keyboardType}
          style={{
            flex: 1,
            height: 30,
            textAlignVertical: 'center',
          }}
          onChangeText={onChangeText} // 使用传入的onChangeText
        />
      )}
      {fieldButtonLabel && (
        <TouchableOpacity onPress={fieldButtonFunction}>
          <Text
            style={{
              color: 'black',
              fontSize: 15,
              fontFamily: 'Roboto',
              fontWeight: '400',
            }}>
            {fieldButtonLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
