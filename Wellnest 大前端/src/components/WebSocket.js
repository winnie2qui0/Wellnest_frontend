import {useEffect, useState} from 'react';

const useWebSocket = url => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.onmessage = e => {
      const message = e.data;
      console.log('WebSocket Message Received:', message);
      setMessages(prevMessages => [...prevMessages, message]);
    };

    ws.onerror = e => {
      console.log('WebSocket Error:', e.message);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url]);

  return {messages, socket};
};

export default useWebSocket;
