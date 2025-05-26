import React, { useState } from 'react';
import axios from 'axios';

const ShareComic = ({ chatId, onShareComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleShare = async (share) => {
    setIsLoading(true);
    setError(null);

    try {
      // 调用后端分享接口
      const response = await axios.post('/comic/share', {
        chatId,  // 漫画对应的聊天记录 ID
        share    // 用户选择的分享状态
      });

      // 调用成功后的操作
      console.log('Share successful:', response.data);
      onShareComplete && onShareComplete(share); // 通知父组件
    } catch (err) {
      console.error('Error sharing comic:', err);
      setError('分享失败，请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleShare(true)} disabled={isLoading}>
        分享
      </button>
      <button onClick={() => handleShare(false)} disabled={isLoading}>
        取消分享
      </button>
      {isLoading && <p>正在处理...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ShareComic;