import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import TopBar from '../components/TopBar';
import {COLORS, FONTS} from '../constants';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const questions = [
  {
    questionText: '難以入睡、易醒或早醒',
    options: ['1', '2', '3', '4', '5'],
    imageUri: require('../assets/material/10.png'),
  },
  {
    questionText: '感覺緊張或不安',
    options: ['1', '2', '3', '4', '5'],
    imageUri: require('../assets/material/11.png'),
  },
  {
    questionText: '覺得容易苦惱或動怒',
    options: ['1', '2', '3', '4', '5'],
    imageUri: require('../assets/material/12.png'),
  },
  {
    questionText: '感覺憂鬱、心情低落',
    options: ['1', '2', '3', '4', '5'],
    imageUri: require('../assets/material/8.png'),
  },
  {
    questionText: '覺得自己比不上別人',
    options: ['1', '2', '3', '4', '5'],
    imageUri: require('../assets/material/13.png'),
  },
  {
    questionText: '有自殺的想法',
    options: ['1', '2', '3', '4', '5'],
    imageUri: require('../assets/material/7.png'),
  },
];

const QuestionnaireScreen = ({navigation}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = questions[currentQuestionIndex];
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [userId, setUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('user_id');
      const token = await AsyncStorage.getItem('userToken');
      setUserId(id);
      setUserToken(token);
      console.log('userToken:', token);
      console.log('userId:', id);
    };
    fetchUserId();
  }, []);

  const resetAnswers = () => {
    setAnswers(Array(questions.length).fill(null));
    setCurrentQuestionIndex(0);
  };

  const goNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswer = option => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = parseInt(option, 10);
    setAnswers(newAnswers);

    // if (currentQuestionIndex < questions.length - 1) {
    //   setCurrentQuestionIndex(currentQuestionIndex + 1);
    // }
  };

  const handleSubmit = async () => {
    // Exclude the score for the question about suicidal thoughts
    const suicidalThoughtsIndex = questions.findIndex(q =>
      q.questionText.includes('自殺的想法'),
    );
    const totalScore = answers.reduce((total, num, index) => {
      if (index !== suicidalThoughtsIndex) {
        return total + (num || 0);
      }
      return total;
    }, 0);

    console.log('提交問卷', answers);
    console.log('Total score:', totalScore);

    try {
      await axios.post(
        'http://140.119.202.10:8080/scales',
        {
          userId: userId,
          totalScore: totalScore,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );
      console.log('Data sent to server successfully');
    } catch (error) {
      console.error('Error sending data to server:', error);
    }

    navigation.navigate('Result', {questions, answers, totalScore});
  };

  const currentOptions = questions[currentQuestionIndex]?.options;

  if (!currentOptions) {
    console.log('選項數據不存在');
    return <Text>問題數據加載錯誤！</Text>;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TopBar navigation={navigation} />
        <View style={styles.questionContainer}>
         
          <Text
            style={{
              margin: 5,
              ...FONTS.h4,
              fontWeight: 600,
              textAlign: 'center',
            }}>
            最近一個星期，你的感受如何？
          </Text>
        </View>
        <View style={styles.imageContainer}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
            }}>
            <Image style={styles.image} source={currentQuestion.imageUri} />
          </View>
        </View>
       
        <View style={styles.progressBarContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            {questions.map((question, index) => (
              <Icon
                key={index}
                name={'remove-outline'}
                size={45}
                color={index === currentQuestionIndex ? 'black' : '#DADADA'}
                style={styles.progressIcon}
              />
            ))}
          </View>

          <Text style={styles.descriptionText}>
            {currentQuestion.questionText}
          </Text>
          <View
            style={{
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            <View
              style={{
                justifyContent: 'space-evenly',
                alignContent: 'center',
                flexDirection: 'row',
                padding: 5,
              }}>
              {currentOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.touchableborder,
                    answers[currentQuestionIndex] === parseInt(option) ? styles.selectedOption : null
                  ]}
                  onPress={() => handleAnswer(option)}>
                  <Text >{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View
              style={{
                justifyContent: 'space-evenly',
                alignContent: 'center',
                flexDirection: 'row',
              }}>
              <Text style={{ fontSize: 12,marginStart: -35}}>完全無感</Text>
              <Text style={{fontSize: 12,}}>中等程度</Text>
              <Text style={{fontSize: 12,marginEnd: -35}}>非常有感</Text>
            </View>
          </View>
        </View>

        <View style={styles.navigationContainer}>
          
          <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
            <Text style={styles.goBackText}>返回</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => {
              if (currentQuestionIndex === questions.length - 1) {
                handleSubmit();
              } else {
                goNext();
              }
            }}>
            <Text style={styles.nextText}>
              {currentQuestionIndex === questions.length - 1
                ? '送出'
                : '下一題'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#EDEBDC',
  },
  safeArea: {
    flex: 1,
    flexDirection: 'column',
  },
  questionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    paddingLeft: 50,
    paddingRight: 50,
  },
  titleText: {
    margin: 15,
    ...FONTS.hㄉ,
    fontWeight: 'bold',
  },
  descriptionText: {
    margin: 10,
    ...FONTS.h4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    marginTop: 10,
    marginLeft: 50,
    marginRight: 50,
    padding: 35,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    backgroundColor:'#A9CAB2',
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
  },
  progressBarContainer: {
    flex: 1.5,
    backgroundColor: '#FCF7E8',
    marginLeft: 30,
    marginRight: 30,
    borderRadius: 28,
    justifyContent: 'center',
    alignContent: 'center',
  },
  progressIcon: {
    marginTop: -40,
    marginRight: -6,
  },
  navigationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    margin: 10,
  },
  goBackButton: {
    width: 110,
    height: 40,
    margin: 10,
    borderRadius: 100,
    alignItems: 'center',
  },
  goBackText: {
    color: 'black',
    fontSize: 15,
    fontFamily: 'Rhodium Libre',
    fontWeight: 'bold',
    margin: 10,
  },
  nextButton: {
    backgroundColor: '#87988C',
    width: 100,
    height: 40,
    margin: 10,
    borderRadius: 100,
    alignItems: 'center',
  },
  nextText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Rhodium Libre',
    fontWeight: 'bold',
    margin: 10,
  },
  touchableborder: {
    height: 40,
    width: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: '#D9D9D9',
    margin: 5,
  },
  circleborder: {
    height: 25,
    width: 25,
    fontSize: 15,
    borderRadius: 0.5 * 25,
    textAlign: 'center',
    paddingTop: 0.8,
    borderColor: 'black',
    borderWidth: 1.7,
    display: 'flex',
  },
  selectedOption: {
    backgroundColor: '#E3B7AA', // Gold color for selection
  },
});

export default QuestionnaireScreen;
