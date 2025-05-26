import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  Button,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../components/AuthContext';
import EventSource from 'react-native-event-source';
import Icon from 'react-native-vector-icons/Ionicons';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import TopBar from '../components/TopBar';
import ChatbotScene from '../scenes/chatbotScene';
import {useFocusEffect} from '@react-navigation/native';

const HomeScreen = ({navigation, route}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentAiMessage, setCurrentAiMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [userToken, setUserToken] = useState('');
  const [showMissionButton, setShowMissionButton] = useState(false);
  const [audioQueue, setAudioQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [comicModalVisible, setComicModalVisible] = useState(false);  

  const {setIsUserLoggedIn} = useContext(AuthContext);

  useFocusEffect(
    useCallback(() => {
      const initializeChat = async () => {
        try {
          const [storedUserId, storedUserToken] = await Promise.all([
            AsyncStorage.getItem('user_id'),
            AsyncStorage.getItem('userToken'),
          ]);

          if (storedUserId && storedUserToken) {
            setUserId(storedUserId);
            setUserToken(storedUserToken);
            await checkAndCreateChat(storedUserToken);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      };

      initializeChat();

      if (route.params?.source === '任務' && route.params?.generateComic) {
        setMessages(prevMessages => [
          ...prevMessages,
          {sender: 'ai', text: '快跟我分享！讓我來為你紀錄吧'},
        ]);
      }
    }, [route.params?.generateComic]),
  );

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false),
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  useEffect(() => {
    playNextAudio();
  }, [audioQueue, isPlaying]);

  const checkAndCreateChat = async token => {
    if (route.params?.generateComic) {
      console.log('跳過聊天創建，因為 generateComic 為 true');
      return;
    }

    const chatCreated = await AsyncStorage.getItem('chatCreated');
    const activeChat = await AsyncStorage.getItem('activeChat');

    if (chatCreated === 'true' && activeChat === 'true') {
      console.log('Active chat already exists.');
      return;
    }

    //Otherwise, create a new chat
    await createChat(token);
    await AsyncStorage.setItem('chatCreated', 'true');
    await AsyncStorage.setItem('activeChat', 'true');
  };

  const createChat = async token => {
    try {
      const response = await fetch('http://140.119.202.10:8080/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({userId}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Chat already exists') {
          console.log('A chat already exists for this user.');
        } else {
          throw new Error(errorData.message || 'Unknown error');
        }
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert(`Failed to create chat: ${error.message}`);
    }
  };

  const playNextAudio = () => {
    if (audioQueue.length > 0 && !isPlaying) {
      setIsPlaying(true);
      const nextAudioPath = audioQueue[0];

      const sound = new Sound(nextAudioPath, '', error => {
        if (error) {
          // console.error('加載音頻文件失敗:', error);
          setIsPlaying(false);
          setAudioQueue(queue => queue.slice(1));
          return;
        }

        sound.play(success => {
          sound.release();
          setAudioQueue(queue => queue.slice(1));
          setIsPlaying(false);
        });
      });
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    setMessages(prevMessages => [
      ...prevMessages,
      {sender: 'user', text: inputMessage},
    ]);
    setInputMessage('');

    const url = `http://140.119.202.10:8080/chat/message?user=${userId}&prompt=${encodeURIComponent(
      inputMessage,
    )}`;
    let eventSource = new EventSource(url);

    let aiMessageBuffer = ''; // 用于累积AI的消息

    eventSource.addEventListener('message', event => {
      const data = JSON.parse(event.data);

      if (data && data.code === 0) {
        if (data.data.messageType === 'AUDIO') {
          const base64Audio = data.data.message; // Base64编码的音频数据
          const audioPath = `${
            RNFS.DocumentDirectoryPath
          }/${new Date().getTime()}`;

          // 将Base64编码的音频数据写入文件
          RNFS.writeFile(audioPath, base64Audio, 'base64')
            .then(() => {
              console.log('音频文件写入成功:', audioPath); // 打印文件路径
              setAudioQueue(currentQueue => [...currentQueue, audioPath]);
            })
            .catch(err => {
              console.error('写入音频文件失败:', err);
              // 跳过错误，不影响后续操作
              return Promise.resolve(); // 确保继续后续的代码
            });
        } else if (data.data.messageType === 'TEXT') {
          const messageText = data.data.message;

          if (messageText.startsWith("A:")) {
            messageText = messageText.slice(1).trim();
          }

          if (messageText !== '#') {
            // 累积AI的消息到缓冲区
            aiMessageBuffer += messageText;
            // 动态更新当前AI消息，仅用于显示
            setCurrentAiMessage(aiMessageBuffer);
          } else {
            // 当收到"#"时，将累积的消息添加到messages中，并清空aiMessageBuffer
            if (aiMessageBuffer.trim() !== '') {
              setMessages(prevMessages => [
                ...prevMessages,
                {sender: 'ai', text: aiMessageBuffer},
              ]);
              aiMessageBuffer = '';
              setCurrentAiMessage('');
            }
          }
        }

        if (data.data.end) {
          eventSource.close();
          storeMessage(inputMessage);
          setShowMissionButton(true); // Show finish button after chat ends
        }
      }

      eventSource.addEventListener('error', error => {
        console.error('EventSource failed:', error);
        eventSource.close();
      });
    });
  };

  const storeMessage = async message => {
    try {
      const response = await fetch('http://140.119.202.10:8080/message/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          content: message,
          userId: parseInt(userId),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error) {
      console.error('Error storing message:', error);
      alert('An error occurred while storing the message. Please try again.');
    }
  };

  const finishChat = async () => {
    try {
      const response = await fetch('http://140.119.202.10:8080/chat/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({userId}),
      });

      // if (response.ok) {
      //   await AsyncStorage.removeItem('activeChat');
      // } else {
      //   throw new Error('Failed to finish chat');
      // }
      hideMissionButton();
    } catch (error) {
      console.error('Error finishing chat:', error);
      alert('Failed to finish chat. Please try again.');
    }
  };

  const hideMissionButton = () => {
    setShowMissionButton(false);
    setModalVisible(true);
  };

  const navigateToMissions = () => {
    setModalVisible(false);
    navigation.navigate('任務', {autoFetch: true});
  };

  const handleComicGeneration = () => {
    setComicModalVisible(true);  
  };
  
  const closeComicModal = () => {
    setComicModalVisible(false);  
  };
  

  const handleNavigateToComic = () => {
    setComicModalVisible(false);  
    navigation.navigate('心情日記', {autoFetch: true});  
    AsyncStorage.removeItem('chatCreated');
    AsyncStorage.removeItem('activeChat');
    setInputMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 10} // Offset for iOS to avoid navbar covering
      >
        <TopBar navigation={navigation} />
        <ScrollView
          style={[
            styles.chatContainer,
            isKeyboardVisible && styles.chatContainerWithKeyboard,
          ]}
          ref={scrollViewRef}>
          {messages.map((msg, index) => (
            <View
              key={index}
              style={
                msg.sender === 'user' ? styles.userMessage : styles.aiMessage
              }>
              <Text>{msg.text}</Text>
            </View>
          ))}
          {currentAiMessage ? (
            <Text style={styles.aiMessage}>{currentAiMessage}</Text>
          ) : null}
        </ScrollView>

        <View style={styles.fixedView}>
          <View style={styles.sceneContainer}>
            <ChatbotScene />
            {route.params?.generateComic ? (
              // 如果 route.params.generateComic 為 true 顯示 "生成漫畫" 按鈕
              <TouchableOpacity
                style={styles.comicButton}
                onPress={handleComicGeneration}>
                <Icon name="cloud" size={30} color="white" />
              </TouchableOpacity>
            ) : (
              // 如果 route.params.generateComic 為 false，則顯示 "下次再聊" 按鈕
              <View>
                {showMissionButton && (
                  <TouchableOpacity
                    style={styles.missionButton}
                    onPress={finishChat}>
                    <Icon name="gift" size={30} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="輸入你的心情吧..."
            placeholderTextColor="#4C241D"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Icon name="send" size={30} color="#4C241D" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {/* Modal 彈窗 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Image
              source={require('../assets/material/13.png')} // 使用 require 加載本地圖片
              style={styles.modalImage}
            />
            <Text style={styles.modalText}>看看適合你的活動吧~</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.yesmodalButton}
                onPress={navigateToMissions}>
                <Text style={styles.yesmodalButtonText}>好啊</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nomodalButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.nomodalButtonText}>下次再來</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={comicModalVisible}  // 通过 comicModalVisible 状态控制第二个 Modal
        onRequestClose={closeComicModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Image
              source={require('../assets/material/5.png')}
              style={styles.modalImage}
            />
            <Text style={styles.modalText}>幫你記錄下今天的心情？</Text>
            <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.yesmodalButton}
              onPress={handleNavigateToComic}>  
              <Text style={styles.yesmodalButtonText}>好啊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nomodalButton}
              onPress={closeComicModal}>
              <Text style={styles.nomodalButtonText}>下次再說</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBDC',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
    marginBottom: 130,
  },
  chatContainerWithKeyboard: {
    flex: 1,
    paddingHorizontal: 10,
    marginBottom: 0, // 鍵盤顯示時移除 marginBottom
  },
  fixedView: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0)',
    zIndex: 2, // Ensures this view is on top of ScrollView
  },
  sceneContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'white',
    borderRadius: 20,
    borderBottomRightRadius: 0.5,
    marginVertical: 5,
    marginRight: 10,
    marginLeft: 20,
    padding: 10,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3B7AA',
    borderRadius: 20,
    borderBottomLeftRadius: 0.5,
    marginVertical: 5,
    marginRight: 20,
    marginLeft: 10,
    padding: 10,
  },
  inputContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    borderRadius: 50,
    alignItems: 'center',
    padding: 5,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    color: 'black',
  },
  sendButton: {
    marginLeft: 10,
  },
  comicButton: {
    width: 'auto',
    backgroundColor: '#E3B7AA',
    borderRadius: 100,
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 20,
  },
  missionButton: {
    width: 'auto',
    backgroundColor: '#E3B7AA',
    borderRadius: 100,
    padding: 10,
    margin: 20,
  },
  finishButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#4C241D',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalImage: {
    width: 150,
    height: 100,
    marginBottom: 20,
  },
  modalView: {
    margin: 50,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  yesmodalButton: {
    width: 100,
    backgroundColor: '#4C241D',
    borderWidth: 1,
    borderColor: '#4C241D',
    padding: 10,
    borderRadius: 30,
    margin: 10,
  },
  yesmodalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  nomodalButton: {
    width: 100,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4C241D',
    padding: 10,
    borderRadius: 30,
    margin: 10,
  },
  nomodalButtonText: {
    color: '#4C241D',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default HomeScreen;