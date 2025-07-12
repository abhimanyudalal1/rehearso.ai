import { useEffect, useRef, useState } from 'react';

interface StreamlitControlMessage {
  status: 'success' | 'error' | 'info' | 'running' | 'stopped';
  message: string;
  pid?: number;
}

interface UseStreamlitControlReturn {
  isConnected: boolean;
  isStreamlitRunning: boolean;
  isStreamlitReady: boolean;
  startStreamlit: () => void;
  stopStreamlit: () => void;
  checkStatus: () => void;
  checkReady: () => Promise<boolean>;
  lastMessage: StreamlitControlMessage | null;
}

export const useStreamlitControl = (): UseStreamlitControlReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreamlitRunning, setIsStreamlitRunning] = useState(false);
  const [isStreamlitReady, setIsStreamlitReady] = useState(false);
  const [lastMessage, setLastMessage] = useState<StreamlitControlMessage | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  const connect = () => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket('ws://localhost:8000/ws/streamlit-control');
    
    ws.onopen = () => {
      console.log('Streamlit control WebSocket connected');
      setIsConnected(true);
      // Check initial status
      ws.send(JSON.stringify({ command: 'status' }));
    };

    ws.onmessage = (event) => {
      try {
        const message: StreamlitControlMessage = JSON.parse(event.data);
        setLastMessage(message);
        
        // Update running status based on message
        if (message.status === 'running') {
          setIsStreamlitRunning(true);
        } else if (message.status === 'stopped') {
          setIsStreamlitRunning(false);
        } else if (message.status === 'success') {
          if (message.message.includes('started')) {
            setIsStreamlitRunning(true);
          } else if (message.message.includes('stopped')) {
            setIsStreamlitRunning(false);
          }
        }
        
        console.log('Streamlit control message:', message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Streamlit control WebSocket disconnected');
      setIsConnected(false);
      setIsStreamlitRunning(false);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (websocketRef.current === ws) {
          connect();
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('Streamlit control WebSocket error:', error);
    };

    websocketRef.current = ws;
  };

  const disconnect = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
      setIsConnected(false);
      setIsStreamlitRunning(false);
    }
  };

  const sendCommand = (command: string) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({ command }));
    } else {
      console.warn('WebSocket not connected. Cannot send command:', command);
    }
  };

  const startStreamlit = () => sendCommand('start');
  const stopStreamlit = () => sendCommand('stop');
  const checkStatus = () => sendCommand('status');

  const checkReady = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/streamlit/ready');
      const data = await response.json();
      const ready = data.ready === true;
      setIsStreamlitReady(ready);
      return ready;
    } catch (error) {
      console.error('Error checking Streamlit ready status:', error);
      setIsStreamlitReady(false);
      return false;
    }
  };

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    isStreamlitRunning,
    isStreamlitReady,
    startStreamlit,
    stopStreamlit,
    checkStatus,
    checkReady,
    lastMessage,
  };
};
