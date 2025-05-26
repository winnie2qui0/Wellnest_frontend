import React, {useRef,useState, useEffect, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Button,
  FlatList,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from '../components/TopBar';
import {AuthContext} from '../components/AuthContext';
import ChatbotScene from '../scenes/chatbotScene';
import Icon from 'react-native-vector-icons/Ionicons';

const API_URL = 'http://140.119.202.10:8080'; // Update this to your actual backend URL

const MissionsScreen = ({navigation, route}) => {
  const [missions, setMissions] = useState([]);
  const pageIndicatorOpacity = useRef(new Animated.Value(1)).current;
  const [currentPage, setCurrentPage] = useState(1);
  const flatListRef = useRef(null);
  const [userId, setUserId] = useState('');
  const [userToken, setUserToken] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [userInput, setUserInput] = useState('');
  const authContext = useContext(AuthContext);
  const {setIsUserLoggedIn} = authContext;
  const [selectedMission, setSelectedMission] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [showCompletionButtons, setShowCompletionButtons] = useState(false);
  const [loading, setLoading] = useState(null);
  const [selectedComic, setSelectedComic] = useState(null); // 用來儲存選擇的漫畫

  // const missions = [
  //   {
  //     chatData: {
  //       chatId: 48,
  //       date: '2024-09-30T17:13:14.045+00:00',
  //       dialogue: [],
  //       title: '《突破重圍的曙光》',
  //       urlsByType: { comic: [{ url: 'https://wellnestbucket.s3.amazonaws.com/comic_images/20241115/73/comic_2.webp' }, { url: 'https://wellnestbucket.s3.amazonaws.com/comic_images/20241115/73/comic_3.webp' }] },
  //     },
  //     content: '在住家附近散步5分鐘',
  //     difficulty: 0,
  //     emotions: [],
  //     missionID: 1,
  //   },
  //   {
  //     chatData: {
  //       chatId: 50,
  //       date: '2024-09-30T20:56:53.964+00:00',
  //       dialogue: [],
  //       title: '《暴風夜的溫暖》',
  //       urlsByType: {
  //         comic: [
  //           { url: 'https://wellnestbucket.s3.amazonaws.com/comic_images/20241115/73/comic_6.webp' },
  //           { url: 'https://wellnestbucket.s3.amazonaws.com/comic_images/20241115/73/comic_7.webp' },
  //         ],
  //       },
  //     },
  //     content: '繞著自家建築物走一圈',
  //     difficulty: 0,
  //     emotions: [],
  //     missionID: 2,
  //   },
  // ];
  
  const checkToken = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User token is missing');
      }
    } catch (error) {
      console.error('Failed to fetch user token:', error);
    }
  };
  
  useEffect(() => {
    checkToken();
  }, []);


  useEffect(() => {
    const initializeMission = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        const storedUserToken = await AsyncStorage.getItem('userToken');
        if (storedUserId && storedUserToken) {
          setUserId(storedUserId);
          setUserToken(storedUserToken);
        }
      } catch (error) {
        console.error('Failed to fetch user data from AsyncStorage:', error);
      }
    };

    initializeMission();
  }, []);

  useEffect(() => {
    if (route.params?.autoFetch) {
      fetchMissions();
    }
  }, [route.params]);

  const fetchMissions = async () => {
     setLoading(true); 
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          throw new Error('User token is missing or invalid');
      }
      console.log("User Token:", userToken); 
  
      const response = await fetch(`${API_URL}/mission`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`, // Include the Bearer token
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // 獲取錯誤詳情
        throw new Error(`Failed to fetch missions: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Missions data:', data);
      
      setMissions(data);
    } catch (error) {
      console.error('Error fetching missions:', error.message || error);
    }finally {
      setLoading(false); 
    }
  };


  const handleComicPress = (chatData) => {
    setSelectedComic(chatData);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedComic(null);
  };



  const handleMissionPress = mission => {
    // 彈出 Alert 來確認是否選擇任務
    Alert.alert(
      '選擇確認',
      `你確定要選擇這項任務 "${mission.content}" 嗎？`,
      [
        {
          text: '否',
          onPress: () => console.log('任務選擇取消'),
          style: 'cancel',
        },
        {
          text: '確定',
          onPress: () => confirmMissionSelection(mission)
        },
      ],
      {cancelable: false},
    );
  };
// 用于将选中的任务发送到后端
const submitMissionToBackend = async (mission) => {
  try {
    const response = await fetch(`${API_URL}/mission/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`, // 使用用户的 token 授权
      },
      body: JSON.stringify({
        mission: mission.content, // 将任务内容发送到后端
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit mission to backend');
    }

    console.log('Mission submitted to backend successfully');
  } catch (error) {
    console.error('Error submitting mission to backend:', error);
    Alert.alert('提交任務時出錯', '無法將任務提交到伺服器，請稍後再試。');
  }
};

// 確認選擇任務後的處理邏輯
const confirmMissionSelection = mission => {
  // 確認選擇後將該任務設為選中的任務
  setSelectedMission(mission);
  const newMessage = `太好了，你選擇了<${mission.content}>！如果你完成了請隨時告訴我。`;
  setChatMessages(prevMessages => [...prevMessages, { sender: 'ai', text: newMessage }]);
  setShowCompletionButtons(true); // 顯示完成按鈕

};
 
  const handleMissionCompletion = completed => {
    const userMessage = completed ? '完成了！' : '還沒有';
    const aiResponse = completed
      ? '太棒了！有沒有發生什麼好玩的事。你願不願意跟我分享？'
      : '沒關係，繼續加油！如果完成了隨時告訴我。';
  
      setChatMessages(prevMessages => [
      ...prevMessages,
      { sender: 'user', text: userMessage },
      { sender: 'ai', text: aiResponse }
    ]);
  
    if (completed) {
      setTimeout(() => {
        // 顯示生成漫畫選項
        Alert.alert(
          '紀錄心情',
          '幫你記錄現在的心情？',
          [
            {
              text: '否',
              onPress: () => {
                // 回傳 "沒問題的呦～ 下次再見！"
                userMessage(prevMessages => [
                  ...prevMessages,
                  { sender: 'ai', text: '沒問題的呦～ 下次再見！' }
                ]);
              },
            },
            {
              text: '是',
              onPress: () => navigation.navigate('聊天室', { generateComic: true }), // 導向主畫面且生成漫畫
            },
          ],
          { cancelable: false }
        );
      }, 1000);
    }
  };

  const handleScroll = event => {
    const contentOffsetX = event.nativeEvent.contentOffset.x; // 當前滾動的 X 偏移量
    const pageIndex = Math.floor(contentOffsetX / 400) + 1; // 計算當前頁數（假設每頁寬度為 400）
    setCurrentPage(pageIndex);
  };

  const renderComicImage = ({item, index}) => {
    
    const caption =
      selectedComic?.urlsByType?.comic?.[index]?.caption
        ?.replace(/[\[\]]/g, '')
        .replace(/^caption:/, '')
        .trim() || '';

    // Get dialogue if available
    const dialogue = selectedComic?.dialogue
      ? selectedComic.dialogue
          .find(d => parseInt(d.page, 10) === index + 1)
          ?.content.replace(/\\n/g, '')
      : '';

    return (
      <View style={styles.comicContainer}>
        {dialogue && (
          <View style={styles.dialogueWrapper}>
            <Text style={styles.dialogueText}>{dialogue}</Text>
            <View style={styles.dialogueTail} />
          </View>
        )}
        {/* Display comic image */}
        <Image
          source={{uri: item}}
          style={styles.fullImage}
          resizeMode="contain"
        />

        {/* Display caption if available */}
        {caption ? (
          <View style={styles.captionWrapper}>
            <Text style={styles.captionText}>{caption}</Text>
          </View>
        ) : null}
      </View>
    );
  };



  return (
    <SafeAreaView style={styles.container}>
      <TopBar navigation={navigation} />
      
      <ScrollView style={styles.chatContainer}>
        

      {loading ? (
      <View style={{justifyContent:'center', alignContent:'center', marginTop:50}} >
        <ActivityIndicator  size="large" color="#4C241D" />
      </View>
         // 顯示loading指示器
      ) : (
        <View style={styles.missionsContainer}>
          {selectedMission ? 
          (
            // 顯示已選擇的任務並禁用按鈕
            <TouchableOpacity
              style={[styles.missionContainer, styles.selectedMissionContainer]}
              disabled={true} // 禁用按鈕
            >
              <Text style={[styles.missionText, styles.selectedMissionText]}>
                {selectedMission.content}
              </Text>
            </TouchableOpacity>
          ) : 
          (
            missions.length > 0 ? 
            (
              missions.map((mission, index) => (
                <View key={index} style={styles.missionRow}>
                <TouchableOpacity
                  style={[
                    styles.missionContainer,
                    selectedMission?.id === mission.missionID && styles.selectedMissionContainer,
                  ]}
                  onPress={() => handleMissionPress(mission)}
                  disabled={selectedMission !== null}
                >
                  <Text
                    style={[
                      styles.missionText,
                      selectedMission?.id === mission.missionID && styles.selectedMissionText,
                    ]}
                  >
                    {mission.content}
                  </Text>
                </TouchableOpacity>
            
                <TouchableOpacity
                  style={styles.comicButton}
                  onPress={() => handleComicPress(mission.chatData)}>
                  <Icon name="play-circle-outline" size={30} color="#000" />
                </TouchableOpacity>
              </View>
              ))
            ) : (
              // 沒有任務時顯示
              <View style={styles.noMissionContainer}>
                <Text style={styles.noMissionText}>這裡空空如也</Text>
                <Text style={styles.noMissionText}>快來找我聊天領取任務吧～</Text>
              </View>
            )
          )}
        </View>
      )}

      {/* Modal for Comic */}
      {selectedComic && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={handleModalClose}>
          <SafeAreaView style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleModalClose}>
              <Icon name="close" size={40} color="#000" />
            </TouchableOpacity>

            <Text style={styles.comicTitle}> {selectedComic.title}</Text>

            <FlatList
              ref={flatListRef}
              data={selectedComic.urlsByType.comic.map(c =>
                c.url ? c.url : null,
              )}
              
              renderItem={renderComicImage}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              getItemLayout={(data, index) => ({
                length: 400, // 每個項目的固定寬度/高度
                offset: 400 * index, // 根據索引計算每個項目的位置
                index,
              })}
              onScroll={handleScroll}
              onScrollToIndexFailed={info => {
                // 這個函數可以處理滾動到不可見項目的失敗
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                  });
                });
              }}
            />
            
            {/* 頁數指示器 */}
            <Animated.View
              style={[styles.pageIndicator, {opacity: pageIndicatorOpacity}]}>
              <Text style={styles.pageIndicatorText}>
                {currentPage}/{selectedComic.urlsByType.comic.length}
              </Text>
            </Animated.View>
          </SafeAreaView>
        </Modal>
      )}


        {/* “完成了” 或 “還沒有”按鈕 */}
        {showCompletionButtons && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.completionButton}
              onPress={() => handleMissionCompletion(true)}>
              <Text style={styles.buttonText}>完成了</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.completionButton}
              onPress={() => handleMissionCompletion(false)}>
              <Text style={styles.buttonText}>還沒有</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      {/* Chat messages */}
      {showCompletionButtons && (
        <ScrollView style={styles.chatWrapper}>
        {chatMessages.map((msg, index) => (
            <View
              key={index}
              style={msg.sender === 'user' ? styles.userMessage : styles.aiMessage}>
              <Text>{msg.text}</Text>
            </View>
          ))}

      </ScrollView>
      ) }
      

      <View style={styles.sceneContainer}>
        <ChatbotScene />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBDC',
  },
  sceneContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    marginBottom: 10,
    marginTop:10,
  },
  missionsContainer:{
    justifyContent: 'center',
    marginLeft: 45,
    marginRight: 45,
    marginBottom: 10,
    marginTop: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 15,
    zIndex: 1,
  },
  missionContainer: {
    backgroundColor: '#FCF7E8',
    padding: 15,
    borderRadius: 15,
    marginVertical: 7,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.35,
    shadowRadius: 2.5,
  },
  selectedMissionContainer: {
    backgroundColor: '#FCF7E8',
    padding: 15,
    borderRadius: 15,
    marginVertical: 7,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.35,
    shadowRadius: 2.5,

  },
  missionText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 5,
    fontWeight: 'bold',
    color: '#4C241D',
  },
  selectedMissionText: {
    fontWeight: 'bold',
  },
  comicButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 5,
  },
  comicButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  noMissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCF7E8',
    padding: 15,
    borderRadius: 15,
    marginVertical: 7,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.35,
    shadowRadius: 2.5,
  },
  noMissionText: {
    fontSize: 16,
    color: '#80351E',
    textAlign: 'center',
    padding: 5,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex:1,
    paddingHorizontal: 10,
  },
  chatWrapper:{
    flex:1,
    marginHorizontal:-10
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'white',
    borderRadius: 14,
    borderBottomRightRadius: 0.5,
    marginVertical: 5,
    marginHorizontal: 50,
    padding: 10,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3B7AA',
    borderRadius: 20,
    borderBottomLeftRadius: 0.5,
    marginVertical: 5,
    marginHorizontal: 50,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  completionButton: {
    backgroundColor: '#4C241D',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#EDEBDC',
    justifyContent: 'center',
    alignContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEBDC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#80351E',
  },
  comicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 400, // 固定寬度以保持位置一致
    height: 'auto', // 固定高度
    position: 'relative', // 使用相對位置確保內容不會相互重疊
  },
  captionWrapper: {
    backgroundColor: '#EDEBDC',
    borderRadius: 0,
    width: '70%',
    height: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 3,
    position: 'absolute', // 固定位置
    bottom: 120, // 固定在容器的底部
  },
  captionText: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 16,
    color: '#444',
    flexWrap: 'wrap',
  },
  dialogueWrapper: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    flexShrink: 1,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 20,
    position: 'absolute',
    top: 50,
    overflow: 'visible',
    width: '70%',
  },

  dialogueText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    flexWrap: 'wrap',
  },
  dialogueTail: {
    position: 'absolute',
    bottom: -20,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 25,
    borderTopWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 9},
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fullImage: {
    width: 400, // 圖片填滿容器寬度
    height: '70%', // 固定高度為容器的70%
    position: 'absolute', // 固定圖片位置，防止圖片移動
    top: 60, // 保證圖片在容器頂部開始
    marginHorizontal: 0.5,
    marginTop: 50,
    marginBottom: -20,
  },
  loadingComicContainer: {
    position: 'absolute', // 使用絕對定位覆蓋整個螢幕
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // 半透明黑色背景
    zIndex: 10, // 保證載入層在畫面最上層
  },
  loadingComicText: {
    color: 'white', // 深棕色文字
    fontSize: 18, // 文字大小
    marginTop: 10, // 與載入指示器的間距
    textAlign: 'center',
  },
  stopAutoPlayButton: {
    position: 'absolute',
    bottom: 30, // 可以根據需要調整位置
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    zIndex: 10, // 保證頁數顯示在最上層
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 20, // 可以根據需要調整位置
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    zIndex: 10, // 保證頁數顯示在最上層
  },
  pageIndicatorText: {
    color: 'white',
    fontSize: 16,
  },
  comicTitle: {
    fontSize: 24,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    paddingBottom: -30,
    marginTop:20,
  },
});

export default MissionsScreen;