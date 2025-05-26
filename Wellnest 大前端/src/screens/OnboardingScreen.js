import React from 'react';
import {
  ScrollView,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import {Image} from 'react-native-reanimated/lib/typescript/Animated';

const OnboardingScreen = ({navigation}) => {
  return (
    <ImageBackground
      source={require('../assets/Images/W.jpeg')}
      style={styles.backgroundImage}>
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ScrollView
          style={{
            marginTop: 20,
          }}>
          <View
            style={{
              justifycontent: 'center',
              alignItems: 'center',
              marginBottom: 25,
              padding: 90,
            }}>
            <Text style={styles.text}>Welcome</Text>
            <Text style={styles.text}>to</Text>
            <Text style={styles.text}>WellNest</Text>
          </View>

          <Text
            style={{
              textAlign: 'center',
              marginHorizontal: 10,
              marginBottom: 20,
            }}>
            陪伴你度過每一個低潮
          </Text>
          <Text
            style={{
              textAlign: 'center',
              marginHorizontal: 10,
            }}>
            放慢步調一起聊天吧
          </Text>
        </ScrollView>
      </SafeAreaView>
      <View
        style={{
          backgroundColor: 'white',
          justifyContent: 'center',
          padding: 5,
          paddingBottom: 30,
          paddingLeft: 50,
          paddingRight: 50,
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: 'white',
            borderWidth: 2,
            borderColor: '#B65A3D',
            width: 167,
            height: 52,
            borderRadius: 10,
            margin: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => navigation.navigate('Login')}>
          <Text
            style={{
              color: '#B65A3D',
              fontSize: 13,
              fontFamily: 'Roboto',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: 0.52,
              // wordWrap: 'break-word'
            }}>
            登入
          </Text>
          {/* <MaterialIcons name="arrow-forward-ios" size={22} color="#fff" /> */}
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#80351E',
            borderRadius: 10,
            width: 167,
            height: 52,
            margin: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => navigation.navigate('Register')}>
          <Text
            style={{
              color: 'white',
              fontSize: 13,
              fontFamily: 'Roboto',
              fontWeight: '900',
              letterSpacing: 0.52,
            }}>
            註冊
          </Text>
          {/* <MaterialIcons name="arrow-forward-ios" size={22} color="#fff" /> */}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  text: {
    color: 'black',
    fontSize: 40,
    fontFamily: 'Rhodium Libre',
    fontWeight: '400',
  },
});

export default OnboardingScreen;
