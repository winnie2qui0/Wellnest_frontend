import React from 'react'
import {Image,SafeAreaView, View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../constants";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import TopBar from '../components/TopBar';
import LinearGradient from 'react-native-linear-gradient';


const Settings = ({ navigation }) => {
  const navigateToEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const navigateToSecurity = () => {
    console.log("Security function");
  };

  const navigateToNotifications = () => {
    console.log("Notifications function");
  };

  const navigateToPrivacy = () => {
    console.log("Privacy function");
  };

  const navigateToSubscription = () => {
    console.log("Subscription function");
  };

  const navigateToSupport = () => {
    console.log("Support function");
  };

  const navigateToTermsAndPolicies = () => {
    console.log("Terms and Policies function");
  };

  // const navigateToFreeSpace = () => {
  //   console.log("Free Space function");
  // };

  // const navigateToDateSaver = () => {
  //   console.log("Date saver");
  // };

  const navigateToReportProblem = () => {
    console.log("Report a problem");
  };

  const addAccount = () => {
    console.log("Aadd account ");
  };

  const logout = () => {
    console.log("Logout");
  };

  const accountItems = [
    {
      icon: "person-outline",
      text: "編輯個人檔案",
      action: navigateToEditProfile,
    },
    { icon: "security", text: "帳號安全", action: navigateToSecurity },
    {
      icon: "notifications-none",
      text: "通知",
      action: navigateToNotifications,
    },
    { icon: "lock-outline", text: "隱私", action: navigateToPrivacy },
  ];

  const supportItems = [
    {
      icon: "credit-card",
      text: "我的訂閱",
      action: navigateToSubscription,
    },
    { icon: "help-outline", text: "幫助與支持", action: navigateToSupport },
    {
      icon: "info-outline",
      text: "隱私與政策",
      action: navigateToTermsAndPolicies,
    },
  ];

  // const cacheAndCellularItems = [
  //   {
  //     icon: "delete-outline",
  //     text: "Free up space",
  //     action: navigateToFreeSpace,
  //   },
  //   { icon: "save-alt", text: "Date Saver", action: navigateToDateSaver },
  // ];

  const actionsItems = [
    {
      icon: "outlined-flag",
      text: "問題回報",
      action: navigateToReportProblem,
    },
    { icon: "logout", text: "登出", action: logout },
  ];

  const renderSettingsItem = ({ icon, text, action }) => (
    <TouchableOpacity
      onPress={action}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingLeft: 12,
        backgroundColor: COLORS.white,
      }}
    >
      <MaterialIcons name={icon} size={24} color="black" />
      <Text
        style={{
          marginLeft: 36,
          ...FONTS.semiBold,
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        {text}{" "}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#F2D0B2', '#F7C4BE']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }} // Apply any style you want
    >
    <SafeAreaView
      style={styles.container}
    >
      

      <TopBar navigation={navigation} />
    

      <ScrollView style={{ marginHorizontal: 12 }}>
        {/* Account Settings */}
        <View
          style={{
            alignItems: "center",
            padding:10

          }}
        >
          
            <Image
              source={require('../assets/Images/user-profile.jpg')}
              style={{
                height: 130,
                width: 130,
                borderRadius: 85,
                
              }}
            />
        </View>

        <LinearGradient
          colors={['#EDDCDC', 'rgba(237, 235, 220, 0.00)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}

          style={{
            flex: 1,
            borderRadius: 70, // Set the border radius here
            overflow: 'hidden', // This ensures the child view doesn't bleed outside the border
          }}
        >
            <View style={{
              flex: 1, // You can apply your other styles for the View here
              borderTopLeftRadius:70,
              borderTopRightRadius:70,
              marginTop:40,
              paddingTop:20,
              padding:25
            
              
            }}>
              <View style={{ marginBottom: 30 }}>
          
                <View
                  style={styles.derive}
                >
                  {accountItems.map((item, index) => (
                    <React.Fragment key={index}>
                      {renderSettingsItem(item)}
                    </React.Fragment>
                  ))}
                </View>
              </View>

            {/* Support and About settings */}

            <View style={{ marginBottom: 30 }}>
              
              <View
                style={styles.derive}
              >
                {supportItems.map((item, index) => (
                  <React.Fragment key={index}>
                    {renderSettingsItem(item)}
                  </React.Fragment>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 30 }}>
              <View
                style={ styles.derive}
              >
                {actionsItems.map((item, index) => (
                  <React.Fragment key={index}>
                    {renderSettingsItem(item)}
                  </React.Fragment>
                ))}
              </View>
            </View>

          </View>
        </LinearGradient>
      
      
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  derive:{

    borderRadius: 12,
    backgroundColor: COLORS.white,
    shadowColor: '#000', // for iOS
    shadowOffset: { width: 0, height: 1 }, // for iOS
    shadowOpacity: 0.25, // for iOS
    shadowRadius: 4, // for iOS
    borderRadius: 8,
    padding:10

  }
})

export default Settings;