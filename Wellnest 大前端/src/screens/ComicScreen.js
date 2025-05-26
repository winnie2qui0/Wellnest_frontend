import React, {useState, useRef, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/Ionicons';
import TopBar from '../components/TopBar';
// import Switch from 'react-native-switchbutton';

const ComicScreen = ({navigation, route}) => {
  const [comics, setComics] = useState(Array(10).fill(null));
  const [selectedComic, setSelectedComic] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bgmSound, setBgmSound] = useState(null);
  const [audioQueue, setAudioQueue] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true); // 當前是否處於自動播放模式
  const [isManualMode, setIsManualMode] = useState(false); // 是否處於手動模式
  const [isPlaying, setIsPlaying] = useState(false);
  const autoPlayIntervalRef = useRef(null); // 保存自動播放定時器
  const isAutoPlayingRef = useRef(isAutoPlaying);
  const currentSoundRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const pageIndicatorOpacity = useRef(new Animated.Value(1)).current;
  const [newComics, setNewComics] = useState([]); // 存储正在生成的漫画
  const [isShared, setIsShared] = useState(false);
  const BGM_URL =
    'https://wellnestbucket.s3.ap-southeast-2.amazonaws.com/cozy_bgm.mp3';

  const API_URL = 'http://140.119.202.10:8080';

  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!isFetching && !isGenerating) {
      fetchComicCollection();
    }
  }, []);

  useEffect(() => {
    const fadeOutTimeout = setTimeout(fadeOutPageIndicator, 10000);
    return () => clearTimeout(fadeOutTimeout); // 清理 timeout
  }, []);

  const fadeInPageIndicator = () => {
    Animated.timing(pageIndicatorOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const fadeOutPageIndicator = () => {
    Animated.timing(pageIndicatorOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  // 自動播放狀態的管理
  useEffect(() => {
    if (modalVisible && selectedComic && isAutoPlaying) {
      playBackgroundMusic();
      playAudioForPage(currentPage - 1);
    }
  }, [modalVisible, selectedComic, isAutoPlaying]);

  // 背景音樂播放
  const playBackgroundMusic = () => {
    if (bgmSound) return; // 防止重複播放
    const bgm = playSound(BGM_URL, () => {
      bgm.release();
      setBgmSound(null);
    });
    setBgmSound(bgm);
  };

  const toggleShareStatus = async () => {
    if (!selectedComic || !selectedComic.chatId) {
      Alert.alert('Error', 'No comic selected or chatId is missing.');
      return;
    }
  
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User is not authenticated');
      }
  
      // 發送請求，body 僅包含整數
      const response = await fetch(`${API_URL}/comic/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // 確保使用 JSON 格式
          Authorization: `Bearer ${userToken}`, // 添加 Token 驗證
        },
        body: selectedComic.chatId.toString(), // 傳遞純整數作為字串
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to toggle share status.');
      }
  
      Alert.alert('Success', 'Comic share status updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to toggle share status.');
      console.error('Error toggling share status:', error);
    }
  };

  const stopAutoPlay = () => {
    if (currentSoundRef.current) {
      currentSoundRef.current.stop(() => currentSoundRef.current.release());
      currentSoundRef.current = null;
    }
    setIsAutoPlaying(false); // 更新状态
    clearInterval(autoPlayIntervalRef.current); // 清除定时器
  };

  useEffect(() => {
    const loadComics = async () => {
      try {
        const storedComics = await AsyncStorage.getItem('comics');
        if (storedComics) {
          setComics(JSON.parse(storedComics));
        }
      } catch (error) {
        console.error('Failed to load comics:', error);
      }
    };
    loadComics();
  }, []);

  // Fetch comics collection on screen load
  const fetchComicCollection = async () => {
    if (isFetching) return; // 防止多次請求
    setIsFetching(true);
    setLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('User is not authenticated');
      }
  
      const response = await fetch(`${API_URL}/comic/collection`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch comic collection');
      }
  
      const data = await response.json();
      setComics(data); // 更新漫畫集合
    } catch (error) {
      console.error('Error fetching comic collection:', error);
      setError(error.message); // 在頁面上顯示錯誤
    } finally {
      setLoading(false);
      setIsFetching(false); // 確保重置 isFetching
    }
  };

  const handleScroll = event => {
    const contentOffsetX = event.nativeEvent.contentOffset.x; // 當前滾動的 X 偏移量
    const pageIndex = Math.floor(contentOffsetX / 400) + 1; // 計算當前頁數（假設每頁寬度為 400）
    setCurrentPage(pageIndex);
  };

  const handleModalOpen = comic => {
    setImageLoaded(true);
    setSelectedComic(comic);

    console.log('Selected Comic:', comic);

    // 确保选中漫画包含 chatId
    if (!comic.chatId) {
      console.error('Comic chatId is missing.');
      return;
    }

    // Extract comic URLs and captions
    const comicUrls =
      comic.urlsByType?.comic?.map(c => c.url).filter(url => url) || [];
    const audioUrls = comic.urlsByType?.voice?.filter(url => url) || []; // Filter out undefined or empty audio URLs

    // Preload images
    const imagePromises = comicUrls.map(url => {
      if (url) {
        console.log(`Loading image: ${url}`);
        return Image.prefetch(url);
      }
      return Promise.resolve(); // Skip null or invalid URLs
    });

    // Preload audio
    const audioPromises = audioUrls.map(
      url =>
        new Promise(resolve => {
          if (url) {
            console.log(`Loading audio: ${url}`);
            new Sound(url, null, error => {
              resolve(); // You don't need to release here, as it's handled in playSound
            });
          } else {
            resolve();
          }
        }),
    );

    // Wait for images and audio to preload before opening modal
    Promise.all([...imagePromises, ...audioPromises]).then(() => {
      setImageLoaded(false);
      setModalVisible(true);
    });
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
          .replace(/[\[\]]/g, '')
          .replace(/uv_break/g, '') // 跳過 uv_break
          .trim() // 移除前後多餘空格
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

  const playSound = (url, onEnd) => {
    if (currentSoundRef.current) {
      currentSoundRef.current.stop(() => currentSoundRef.current.release());
      currentSoundRef.current = null;
    }
  
    const sound = new Sound(url, null, (error) => {
      if (error) {
        console.error('Failed to load sound', error);
        return;
      }
      sound.play(() => {
        sound.release();
        if (onEnd) onEnd();
      });
    });
  
    currentSoundRef.current = sound;
    return sound;
  };

  const handleScrollBeginDrag = () => {
    if (isAutoPlaying) {
      Alert.alert(
        '提示',
        '自動播放模式中，無法手動翻頁。請停止自動播放以手動翻頁。',
      );
      return;
    }

    // 自動播放時停止播放並切換到手動模式
    if (isAutoPlaying) {
      stopAutoPlay();
    }

    // 檢查 currentSoundRef 是否有定義再停止和釋放
    if (currentSoundRef.current && typeof currentSoundRef.current.stop === 'function') {
      currentSoundRef.current.stop(() => {
        if (typeof currentSoundRef.current.release === 'function') {
          currentSoundRef.current.release();
        }
        currentSoundRef.current = null; // 確保清空當前音檔
      });
    }

    // 安全地停止並釋放所有音頻，確保音頻實例存在
    audioQueue.forEach(sound => {
      if (sound && typeof sound.stop === 'function') {
        sound.stop(() => sound.release());
      }
    });

    // 清空音頻隊列和當前音頻索引
    setAudioQueue([]);
    setCurrentAudioIndex(0);

    // 顯示頁數指示器，並在 10 秒後淡出
    fadeInPageIndicator();
    setTimeout(fadeOutPageIndicator, 10000);
  };

  const handleMomentumScrollEnd = event => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.floor(contentOffsetX / 400); // 計算當前頁數
    setCurrentPage(pageIndex + 1); // 更新頁碼
  };

  // 自動播放邏輯
  const playAudioForPage = pageIndex => {
    if (!selectedComic || !selectedComic.urlsByType.voice) return;

    // stopAndReleaseSound(currentSoundRef.current); // 確保之前的音效停止

    const pageAudioUrls = selectedComic.urlsByType.voice.filter(url => {
      const pageMatch = url.match(/(n|d)_(\d+)_/);
      return pageMatch && parseInt(pageMatch[2], 10) === pageIndex + 1;
    });

    let audioIndex = 0;

    const playNextAudio = () => {
      if (audioIndex >= pageAudioUrls.length) {
        if (pageIndex+1 >= selectedComic.urlsByType.comic.length) {
          // 最後一頁結束
          Alert.alert('提示', '漫畫已結束');
          setIsAutoPlaying(false); // 切換到手動模式
          stopAndReleaseSound(bgmSound); // 停止背景音樂
          return;
        
        }
        // 自動切換到下一頁
        flatListRef.current?.scrollToIndex({
          index: pageIndex + 1,
          animated: true,
        });
        setCurrentPage(pageIndex + 2);
        playAudioForPage(pageIndex + 1);
      } else {
        const sound = playSound(pageAudioUrls[audioIndex], () => {
          audioIndex += 1;
          playNextAudio();
        });
        currentSoundRef.current = sound;
      }
    };

    playNextAudio();
  };


  // 停止所有音效
  const stopAndReleaseSound = (sound) => {
    if (sound && typeof sound.stop === 'function' && typeof sound.release === 'function') {
      sound.stop(() => sound.release());
    }
  };

  const stopAllAudio = () => {
    if (currentSoundRef.current) {
      currentSoundRef.current.stop(() => currentSoundRef.current.release());
      currentSoundRef.current = null;
    }
  };

  // 自動播放啟動
  const startAutoPlay = () => {
    stopAllAudio(); // 停止並釋放現有音效
    setIsAutoPlaying(true);
    setIsManualMode(false);
    playAudioForPage(currentPage - 1); // 從當前頁開始播放
  };

  // 切換到手動模式
  const togglePlaybackMode = () => {
    if (isAutoPlaying) {
      // 切換到手動模式
      setIsAutoPlaying(false); // 關閉自動播放
      setIsManualMode(true); // 啟用手動模式
      releaseAllResources();
    } 
    else {
      // 切換回自動播放
      if (currentPage === selectedComic.urlsByType.comic.length) {
        // 最後一頁時詢問是否重播
        Alert.alert('重播', '是否要從第一頁重新播放？', [
          { text: '離開', onPress: () => handleModalClose() },
          {
            text: '是',
            onPress: () => {
              setCurrentPage(1);
              flatListRef.current?.scrollToIndex({ index: 0, animated: true });
              setIsAutoPlaying(true); // 更新 Switch 狀態
              startAutoPlay();
            },
          },
        ]);
      } else {
        setIsAutoPlaying(true);
        startAutoPlay();
      }
    }
  };

  // 手動模式音頻播放
  const playCurrentPageAudio = () => {
    if (!selectedComic || !selectedComic.urlsByType.voice) return;

    const pageAudioUrls = selectedComic.urlsByType.voice.filter(url => {
      const pageMatch = url.match(/(n|d)_(\d+)_/);
      return pageMatch && parseInt(pageMatch[2], 10) === currentPage;
    });

    if (pageAudioUrls.length > 0) {
      playSound(pageAudioUrls[0]);
    }
  };

  const renderPageIndicator = () => (
    <Animated.View
      style={[styles.pageIndicator, {opacity: pageIndicatorOpacity}]}>
      <Text style={styles.pageIndicatorText}>
        {currentPage}/{selectedComic.urlsByType.comic.length}
      </Text>
      {isManualMode && (
        <Button title="播放音頻" onPress={playCurrentPageAudio} />
      )}
    </Animated.View>
  );

  const releaseAllResources = () => {
    try {
      // 停止並釋放背景音樂
      if (bgmSound && typeof bgmSound.stop === 'function') {
        bgmSound.stop(() => {
          if (typeof bgmSound.release === 'function') {
            bgmSound.release();
          }
          setBgmSound(null); // 確保清空背景音效
        });
      }
  
      // 停止並釋放當前音檔
      if (currentSoundRef.current && typeof currentSoundRef.current.stop === 'function') {
        currentSoundRef.current.stop(() => {
          if (typeof currentSoundRef.current.release === 'function') {
            currentSoundRef.current.release();
          }
          currentSoundRef.current = null; // 確保清空當前音檔
        });
      }
  
      // 快速釋放音檔隊列
      if (audioQueue.length > 0) {
        audioQueue.forEach((sound) => {
          if (sound && typeof sound.stop === 'function') {
            sound.stop(() => {
              if (typeof sound.release === 'function') {
                sound.release();
              }
            });
          }
        });
        setAudioQueue([]); // 清空音檔隊列
      }
    } catch (error) {
      console.error('Error releasing audio resources:', error);
    }
  };

  const handleModalClose = async () => {
    // 釋放所有資源
    releaseAllResources();
    setAudioQueue([]); // 清空音效隊列
    setModalVisible(false);
    setIsAutoPlaying(false); // 停止自動播放
  
    // 確保重新加載漫畫集合
  try {
    await fetchComicCollection();
  } catch (error) {
    console.error('Failed to fetch comic collection:', error);
  } finally {
    setIsFetching(false); // 確保重置 isFetching
  }
  };

  const formatDate = dateString => {
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${month}/${day}`;
  };

  const renderComicCover = ({item}) => {
    // Get the caption and remove square brackets and any "caption:" prefix
    if (isGenerating && item === null) {
      return (
        <View style={styles.coverContainer}>
          <ActivityIndicator size="large" color="#80351E" />
          <Text style={styles.loadingText}>生成中...</Text>
        </View>
      );
    }

    if (
      !item ||
      !item.urlsByType ||
      !item.urlsByType.comic ||
      !item.urlsByType.comic[0]
    ) {
      return (
        <View style={styles.coverContainer}>
          <ActivityIndicator size="large" color="#80351E" />
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.coverContainer}
          onPress={() => handleModalOpen(item)}>
          <Text style={styles.comicDate}>{formatDate(item.date)}</Text>
          <Text style={styles.comicTitle}> {item.title}</Text>
          <Image
            source={{uri: item.urlsByType.comic[0].url}} // Correctly access the comic URL
            style={styles.coverImage}
          />
        </TouchableOpacity>
      );
    }
  };

  useEffect(() => {
    if (route.params?.autoFetch && !isGenerating) {
      fetchComicCollection();
      setIsGenerating(true); // 防止重複觸發
    }
  }, [route.params, isGenerating]);

  //漫畫生成
  const fetchComic = async () => {
    try {
      // Retrieve the user token from AsyncStorage
      const userToken = await AsyncStorage.getItem('userToken');

      // Ensure userToken exists before making the request
      if (!userToken) {
        throw new Error('User is not authenticated');
      }

      setLoading(true);

      // Make the API request to fetch the comic
      const response = await fetch(`${API_URL}/comic`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`, // Include the Bearer token
        },
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      // Parse the response
      const data = await response.json();

      // 更新主 FlatList 的漫画集合
      await fetchComicCollection();

      // 将新漫画从 `newComics` 中移除
      setNewComics(prev => prev.filter(comic => !comic.generating));
    } catch (error) {
      // Handle errors
      setError(error.message);
      Alert.alert('Error', `Failed to fetch comic: ${error.message}`);
    } finally {
      // Stop the loading spinner
      setLoading(false);
      setIsGenerating(false);
    }
  };

  const renderNewComic = ({item}) => {
    if (item.generating) {
      return (
        <View style={styles.coverContainer}>
          <ActivityIndicator size="large" color="#80351E" />
          <Text style={styles.loadingText}>新漫畫生成中...</Text>
        </View>
      );
    }

    return null; // 如果不是生成状态则不渲染
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>心情日記</Text>
      </View>

      {/* FlatList 用于显示正在生成的漫画 */}
      {newComics.length > 0 && (
        <FlatList
          data={newComics}
          renderItem={renderNewComic}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
        />
      )}

      <FlatList
        data={comics}
        renderItem={renderComicCover}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
      {imageLoaded && !modalVisible && (
        <View style={styles.loadingComicContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingComicText}>載入中</Text>
        </View>
      )}

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
              <Icon name="close" size={30} color="#000" />
            </TouchableOpacity>

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
              onScrollBeginDrag={handleScrollBeginDrag} // 開始拖動時暫停音檔
              onMomentumScrollEnd={handleMomentumScrollEnd} // 滑動結束後播放音檔
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
            <View style={styles.switchContainer}>
              <Text style={styles.label}>
                {isAutoPlaying ? '自動播放' : '手動模式'}
              </Text>
              <Switch
                value={isAutoPlaying}
                onValueChange={togglePlaybackMode}
                trackColor={{ false: '#FFCDD2', true: '#A5D6A7' }} // 关闭和打开的背景颜色
                thumbColor={isAutoPlaying ? '#4CAF50' : '#EDEBDC'} // 圆形按钮的颜色
              />
            </View>

            {/* 分享開關
            {selectedComic && (
              <View style={styles.sbContainer}>
                <Text style={styles.label}>
                  {isShared ? '分享中' : '未分享'}
                </Text>
                <Switch
                  value={isShared} // 绑定分享状态
                  onValueChange={toggleShareStatus} // 状态改变时触发
                  trackColor={{ false: '#FFCDD2', true: '#A5D6A7' }} // 关闭和打开的背景颜色
                  thumbColor={isShared ? '#4CAF50' : '#EDEBDC'} // 圆形按钮的颜色
                />
              </View>
            )} */}

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBDC',
  },
  titleWrapper: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#80351E',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#80351E',
    textAlign: 'center',
    marginVertical: 20,
  },
  comicDate: {
    fontSize: 10,
    color: '#E3B7AA',
    textAlign: 'center',
    padding: 2,
  },
  comicTitle: {
    fontSize: 12,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    paddingBottom: 5,
  },
  grid: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    // backgroundColor:'#E3B7AA',
    height: '200%',
  },
  sbContainer: {
    position: 'absolute',
    bottom: 35,
    right: 20,
    width: 80,
    height: 'auto',

    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  switchContainer: {
    position: 'absolute',
    bottom: 35,
    left: 20,
    width: 100,
    height: 'auto',
    alignSelf: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  coverImage: {
    width: 150,
    height: 150,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
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
  stopAutoPlayText: {
    color: 'white',
    fontSize: 16,
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
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 7,
    zIndex: 1,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  coverContainer: {
    margin: 10,
    marginTop: 30,
    paddingTop: 20,
    width: 150,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 0.1,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#80351E',
    textAlign: 'center',
  },
});

export default ComicScreen;
