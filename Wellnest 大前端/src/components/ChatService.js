import React, {useState, useEffect, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from '../components/TopBar';
import Icon from 'react-native-vector-icons/Ionicons';
import EventSource from 'react-native-event-source';
import {AuthContext} from '../components/AuthContext';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';

const HomeScreen = ({navigation}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentAiMessage, setCurrentAiMessage] = useState('');
  const [userId, setUserId] = useState('');
  const authContext = useContext(AuthContext);
  const {setIsUserLoggedIn} = authContext;
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioQueue, setAudioQueue] = useState([]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId !== null) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Failed to fetch user_id from AsyncStorage:', error);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    console.log('Updated messages: ', messages);
  }, [messages]);

  useEffect(() => {
    playNextAudio();
  }, [audioQueue, isPlaying]);

  const addTestSoundToQueue = () => {
    // 假设你已经把 NAYEON POP! MV.aac 放在了适当的位置
    const testSoundPath = 'Magnetic.aac'; // 注意: 这个路径可能需要根据你的文件存放位置进行调整
    // 将测试音频添加到播放队列中
    // setAudioQueue(currentQueue => [...currentQueue, testSoundPath]);
    var song = new Sound(testSoundPath, Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      // loaded successfully
      console.log(
        'duration in seconds: ' +
          song.getDuration() +
          'number of channels: ' +
          song.getNumberOfChannels(),
      );
      // Play the sound with an onEnd callback
      song.play(success => {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
    });
  };

  const playNextAudio = () => {
    if (audioQueue.length > 0 && !isPlaying) {
      setIsPlaying(true);
      const nextAudioPath = audioQueue[0];
      RNFS.exists(nextAudioPath).then(exists => {
        if (exists) {
          console.log('文件存在:', nextAudioPath);
          const sound = new Sound(nextAudioPath, null, error => {
            if (error) {
              console.log('加载音频文件失败', error);
              setIsPlaying(false);
              return;
            }
            sound.play(success => {
              if (success) {
                console.log('音频播放成功');
              } else {
                console.log('音频播放失败');
              }
              sound.release();
              setIsPlaying(false);
              setAudioQueue(currentQueue => currentQueue.slice(1)); // 移除已播放的音频路径
            });
          });
        } else {
          console.error('文件不存在:', nextAudioPath);
          setIsPlaying(false); // 若文件不存在，重置播放状态，尝试播放队列中的下一个音频
          setAudioQueue(currentQueue => currentQueue.slice(1)); // 移除不存在的音频路径
        }
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

    const url = `http://localhost:8080/chat/message?user=${userId}&prompt=${encodeURIComponent(
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
            .catch(err => console.error('写入音频文件失败:', err));
        } else if (data.data.messageType === 'TEXT') {
          const messageText = data.data.message;

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
        }
      }

      eventSource.addEventListener('error', error => {
        console.error('EventSource failed:', error);
        eventSource.close();
      });
    });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user_id');
    setIsUserLoggedIn(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar navigation={navigation} />

      <ScrollView style={styles.chatContainer}>
        {messages.map((msg, index) => (
          <View
            key={`${msg.sender}-${index}`}
            style={[
              styles.messageContainer,
              msg.sender === 'user' ? styles.userMessage : styles.aiMessage,
            ]}>
            <Text>{msg.text}</Text>
          </View>
        ))}
        {/* Dynamically display the current AI message being received */}
        {currentAiMessage ? (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <Text>{currentAiMessage}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message"
          value={inputMessage}
          onChangeText={setInputMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Icon name="send" size={30} color="#4C241D" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={addTestSoundToQueue}
        style={styles.testSoundButton}>
        <Text style={styles.testSoundButtonText}>Test Sound</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ... (styles)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBDC',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageContainer: {
    borderRadius: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E3B7AA',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#B3E3AA',
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
  },
  sendButton: {
    marginLeft: 10,
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
});

export default HomeScreen;
