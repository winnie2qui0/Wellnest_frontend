import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import Sound from 'react-native-sound';

const ComicViewer = ({ comicData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);  // 控制當前顯示的漫畫
  const [loading, setLoading] = useState(true);  // 初始状态为 true，表示正在加载
  const [audioQueue, setAudioQueue] = useState([]);
  const [imageHeight, setImageHeight] = useState(Dimensions.get('window').height); // 动态获取图片高度

  const { images, audio } = comicData;

  // 播放音频
  const playAudio = (audioUrl) => {
    const sound = new Sound(audioUrl, null, (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
        return;
      }
      sound.play(() => {
        sound.release();
        // 當音頻播放完成後，播放下一段音頻
        if (currentIndex < images.length - 1) {
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }
      });
    });
    setAudioQueue((prevQueue) => [...prevQueue, sound]);
  };

  useEffect(() => {
    // 每當图片滚动改变时，播放对应的音频
    if (audio[currentIndex]) {
      playAudio(audio[currentIndex]);
    }
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      // 在组件卸载时，停止并释放音频资源
      audioQueue.forEach((sound) => {
        sound.stop(() => sound.release());
      });
    };
  }, [audioQueue]);

  // 在 FlatList 滚动时，根据滚动位置动态更新当前显示的漫画索引
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const newIndex = Math.floor(offsetY / imageHeight);  // 使用动态高度计算索引
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item }}
        style={[styles.image, { height: imageHeight }]}
        onLoadEnd={() => setLoading(false)}  // 图片加载完后关闭 loading
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
        pagingEnabled  // 启用分页效果
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  image: {
    width: Dimensions.get('window').width,  // 图片宽度等于屏幕宽度
    resizeMode: 'contain',
  },
});

export default ComicViewer;