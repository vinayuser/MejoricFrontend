import React, { useState, useEffect, useRef } from 'react';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaExpand, FaCompress, FaUserPlus, FaCog, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiPost } from '../utils/api';
import { trackPixel, trackPixelCustom } from '../utils/metaPixel';

// EnableX Configuration
const ENABLEX_APP_ID = '69b7a7f601742c5c950b3e8e';
const ENABLEX_APP_KEY = 'yQuNuGy4eEeYuryByGumuteEyWaayEuquree';

export default function VideoCall() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [error, setError] = useState('');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const roomRef = useRef(null);
  const localStreamRef = useRef(null);

  // Get call session data from navigation state
  const callSessionId = location.state?.callSessionId || '';
  const roomId = location.state?.roomId || new URLSearchParams(window.location.search).get('room') || `room_${Math.random().toString(36).substr(2, 9)}`;
  const userName = `User_${Math.random().toString(36).substr(2, 6)}`;

  useEffect(() => {
    initializeVideoCall();
    
    return () => {
      // Cleanup on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (roomRef.current) {
        try {
          roomRef.current.disconnect();
        } catch (e) {
          console.log('Room disconnect error:', e);
        }
      }
    };
  }, []);

  const initializeVideoCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // In production, you would create a room token from your backend
      // For demo, we'll simulate the connection
      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
        // Track Meta Pixel CallConnected event
        trackPixelCustom("CallConnected", {
          roomId: roomId,
          userName: userName
        });
      }, 2000);

    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Unable to access camera/microphone. Please check permissions.');
      setIsConnecting(false);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const endCall = async () => {
    // Call the end API if we have a callSessionId
    if (callSessionId) {
      try {
        await apiPost('/calls/end', { callSessionId });
        console.log('Call ended successfully');
        
        // Track Meta Pixel CallEnded event
        trackPixelCustom("CallEnded", {
          callSessionId: callSessionId,
          roomId: roomId
        });
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (roomRef.current) {
      try {
        roomRef.current.disconnect();
      } catch (e) {
        console.log('Room disconnect error:', e);
      }
    }
    navigate(-1);
  };

  const addParticipant = () => {
    // In production, this would invite another participant
    setParticipantCount(prev => prev + 1);
  };

  if (isConnecting) {
    return (
      <Layout activePage="VideoCall">
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl text-white font-semibold">Connecting to video call...</h2>
            <p className="text-gray-400 mt-2">Please wait</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout activePage="VideoCall">
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md p-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaVideoSlash className="text-white text-2xl" />
            </div>
            <h2 className="text-xl text-white font-semibold mb-2">Connection Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePage="VideoCall">
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:text-purple-400 transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h2 className="text-white font-semibold">Video Call</h2>
              <p className="text-gray-400 text-sm">Room: {roomId}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">{participantCount} participant{participantCount > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="flex-1 relative p-4">
          {/* Remote Video (Main View) */}
          <div className="w-full h-full bg-gray-800 rounded-2xl overflow-hidden relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Placeholder when no remote video */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <div className="text-center">
                <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUserPlus className="text-white text-4xl" />
                </div>
                <p className="text-white text-lg">Waiting for participants...</p>
                <p className="text-gray-400 text-sm mt-2">Share the room link to invite others</p>
              </div>
            </div>

            {/* Local Video (Picture in Picture) */}
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-xl overflow-hidden shadow-lg border-2 border-gray-700">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <FaVideoSlash className="text-white text-2xl" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                You
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-6">
          <div className="flex items-center justify-center gap-4">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isAudioEnabled 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {isAudioEnabled ? <FaMicrophone className="text-xl" /> : <FaMicrophoneSlash className="text-xl" />}
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isVideoEnabled 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {isVideoEnabled ? <FaVideo className="text-xl" /> : <FaVideoSlash className="text-xl" />}
            </button>

            {/* Add Participant */}
            <button
              onClick={addParticipant}
              className="w-14 h-14 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
            >
              <FaUserPlus className="text-xl" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="w-14 h-14 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
            >
              {isFullscreen ? <FaCompress className="text-xl" /> : <FaExpand className="text-xl" />}
            </button>

            {/* Settings */}
            <button className="w-14 h-14 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors">
              <FaCog className="text-xl" />
            </button>

            {/* End Call */}
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <FaPhoneSlash className="text-xl" />
            </button>
          </div>

          {/* Room Info */}
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              Powered by <span className="text-purple-400 font-semibold">EnableX</span>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
