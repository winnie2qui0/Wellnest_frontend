import React, {useState, useEffect} from 'react';
import TopBar from '../components/TopBar';
import {COLORS, FONTS} from '../constants';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

const QuestionnaireStartScreen = ({navigation}) => {
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
        <View style={styles.container}>
          <Text style={styles.title}>心情溫度計</Text>
          <Text
            style={{
              margin: 5,
              ...FONTS.h5,
              fontWeight: 200,
            }}>
            問卷簡介
          </Text>
        </View>
        <View
          style={styles.wrapper}>
          <View
            style={styles.imagewrapper}>
            <Image
              style={styles.imagecontainer}
              source={require('../assets/material/test.png')}
            />
          </View>
          <View
            style={{
              flex: 1,
              marginBottom: 5,
            }}>
            <Text
              style={{
                lineHeight: 30,
                color:'black',
              }}>
              簡式健康量表 (BSRS)，
              是一種能夠探尋心理狀態的篩檢工具。
            </Text>
            <Text
              style={{
                lineHeight: 30,
                color:'black',
              }}>
              此量表包含6個簡單的題目，
              它可以幫助我們具體了解自己目前的情緒困擾程度，
              並依據測試結果做出適當的處理。
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 0.4,
            alignItems: 'center',
            margin: 10,
          }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Questionnaire')}
            style={styles.button}>
            <Text style={styles.text}>開始作答</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    justifycontent: 'center',
    alignItems: 'center',
    marginTop: 30,
    paddingLeft: 50,
    paddingRight: 50,
  },
  title: {
    margin: 5,
    ...FONTS.h1,
    fontWeight: '600',
    color:'#87988C'
  },
  wrapper:{
    flex: 1,
    marginTop: 10,
    marginLeft: 35,
    marginRight: 35,
    padding: 35,
    borderRadius: 35,
    backgroundColor: '#C7D9CC',
  },
  text: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Rhodium Libre',
    fontWeight: 'bold',
    margin: 10,
  },
  imagewrapper:{
    flex: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  imagecontainer:{
    flex: 1,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#87988C',
    width: 110,
    height: 40,
    margin: 40,
    borderRadius: 100,
    alignItems: 'center',
  },
});

export default QuestionnaireStartScreen;
