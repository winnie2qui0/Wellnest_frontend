import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import ResultScreen from '../screens/ResultScreen';
import QuestionnaireStartScreen from '../screens/QuestionnaireStartScreen';

const Stack = createNativeStackNavigator();

const QuestionnaireStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="QuestionnaireStartScreen"
        component={QuestionnaireStartScreen}
      />
      <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
};

export default QuestionnaireStack;
