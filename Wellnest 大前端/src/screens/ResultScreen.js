import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../constants';
import {ScrollView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import TopBar from '../components/TopBar';

const ResultScreen = ({route, navigation}) => {
  const {questions, answers, totalScore} = route.params;

  const handleHomePress = () => {
    navigation.reset({
      index: 0,
      routes: [{name: '聊天室'}],
    });
  };

  const handleTherapyPress = () => {
    navigation.reset({
      index: 0,
      routes: [{name: '診所'}],
    });
  };

  const getResultInterpretation = () => {
    const suicidalThoughtsScore =
      answers[questions.findIndex(q => q.questionText.includes('自殺的想法'))];

    if (suicidalThoughtsScore && suicidalThoughtsScore >= 2) {
      return (
        <Text style={styles.resultInterpretation}>
          有自殺想法評分為
          <Text style={styles.highlightText}> 2分以上（中等程度）: </Text>
          建議尋求精神醫療專業諮詢
        </Text>
      );
    } else if (totalScore <= 5) {
      return <Text style={styles.resultInterpretation}>一般正常範圍</Text>;
    } else if (totalScore <= 9) {
      return <Text style={styles.resultInterpretation}>輕度情緒困擾：建議找親友談談，抒發情緒</Text>;
    } else if (totalScore <= 14) {
      return <Text style={styles.resultInterpretation}>中度情緒困擾：建議尋求心理衛生或精神醫療專業諮詢</Text>;
    } else {
      return <Text style={styles.resultInterpretation}>重度情緒困擾：建議尋求精神醫療專業諮詢</Text>;
    }
  };

  const interpretation = getResultInterpretation();

  return (
    <SafeAreaView style={styles.container}>
      <TopBar navigation={navigation} />
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>測試結果</Text>
        <ScrollView>
          {questions.map((question, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultQuestion}>{question.questionText}</Text>
              <Text style={styles.resultAnswer}>得分: {answers[index]}</Text>
            </View>
          ))}
          <Text style={styles.resultTotal}>總分: {totalScore}</Text>
          <View style={styles.wrapper}>
            {interpretation}
          </View>
        </ScrollView>
        <View style={styles.buttonwrapper}>
          <TouchableOpacity style={styles.button} onPress={handleHomePress}>
            <Text style={styles.buttonText}>返回主頁</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleTherapyPress}>
            <Text style={styles.buttonText}>前往診所資訊</Text>
          </TouchableOpacity>
        </View>
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBDC',
  },
  resultContainer: {
    marginTop: 15,
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 8,
    padding: 18,
    backgroundColor: '#FCF7E8',
    borderRadius: 10,
  },
  resultQuestion: {
    fontSize: 16,
    textAlign: 'left',
  },
  resultAnswer: {
    fontSize: 16,
    color: '#87988C',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  resultTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
    marginBottom:10,
  },
  wrapper: {
    backgroundColor: '#FDD3D3',
    borderRadius: 15,
    margin: 10,
    padding: 10,
    justifyContent: 'center',
  },
  highlightText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E57D6A', 
    fontWeight: 'bold', 
  },
  resultInterpretation: {
    fontSize: 15,
    fontWeight: '400',
    margin: 10,
    color: 'black',
  },
  button: {
    height: 48,
    width: 125,
    backgroundColor: '#87988C',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal:15,
    borderRadius: 10,
    marginTop: 16,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonwrapper:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginHorizontal:15,
    alignItems: 'center', 

  }
});

export default ResultScreen;
