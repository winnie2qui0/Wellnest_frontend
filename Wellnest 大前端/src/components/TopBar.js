import React from 'react';
import { TouchableOpacity, View, Text} from 'react-native';
import { COLORS, FONTS } from "../constants";
import Icon from 'react-native-vector-icons/Ionicons';


const TopBar = ({ navigation }) => { 
    return (
        <View style={{
            
            marginHorizontal: 12,
            justifyContent:'center',
            flexDirection:'row',
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} 
                    style={{
                        position: "absolute",
                        left: 20,
                                
                    }}>
                     <Icon
                        name={'arrow-back'}
                        size={35}
                        color={'#4C241D'}
                        />
                       
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => navigation.navigate('AppStack')} >
                
                <Text style={{
                    color:'#4C241D',
                    fontSize:22
                    }}> 
                    WellNest 
                    </Text>
                </TouchableOpacity>
            
        </View>

      );
};

export default TopBar;