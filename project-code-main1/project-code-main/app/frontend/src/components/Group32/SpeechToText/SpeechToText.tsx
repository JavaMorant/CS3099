//Using base code from https://github.com/JamesBrill/react-speech-recognition
import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {Audio} from 'react-loading-icons'
import Tooltip from '@mui/material/Tooltip'

import Microphone from '../../../assets/group_32/microphone.svg'
import Microphone_Light from '../../../assets/group_32/microphone-light.svg'
import * as CONSTANTS from '../../../constants/constants';
import { useDarkMode } from '../../../context/DarkModeContext'; 

interface SpeechToTextProps {
  setText: (searchText: string) => void;
  tooltip: string;
}

/**
 * Component for converting speech to text
 * @function
 * @param {SpeechToTextProps} props - Props for the SpeechToText component
 * @returns {ReactElement} React component
 */
const SpeechToText: React.FC<SpeechToTextProps> = ({
  setText,
  tooltip
}) => {
  // State variables
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [browserSupport, setBrowserSupport] = useState(true);
  const { isDarkMode } = useDarkMode();

  // Destructuring values from useSpeechRecognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  
  // Check browser support for speech recognition
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setBrowserSupport(false);
    }
  })
  
  // Function to request microphone access
  const requestMicrophoneAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophoneAccess(true);
    } catch (error) {
      setMicrophoneAccess(false);
    }
  };

  /**
   * Event handler for starting or stopping speech recognition
   * @function
   * @param {React.MouseEvent<HTMLButtonElement>} event - Mouse click event
   * @returns {void}
   */
  const handleSpeechToText: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!microphoneAccess){
      requestMicrophoneAccess();
    }
    resetTranscript();
    if (!listening){
      SpeechRecognition.startListening()
      setIsRecording(true);
    } else {
      SpeechRecognition.stopListening()
      setIsRecording(false);
      resetTranscript();
      if (transcript.length < 400 && transcript.length > 0) {
        setText(transcript);
      }
    }
  }
    
    return (
      <>
        {browserSupport && (
          <Tooltip title={tooltip} placement="top" arrow slotProps={{
            popper: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, -8],
                  },
                },
              ],
            },
          }}>
            <button onClick={handleSpeechToText} className='search-button control-buttons'>
              {isRecording ? (
                <Audio stroke={CONSTANTS.THEME_BLACK} fill={CONSTANTS.THEME_WHITE} strokeOpacity={0} speed={0.75} width={20}/>
              ) : (
                <img src={isDarkMode ? Microphone : Microphone_Light} alt="Speech to text" />
              )}
            </button>
          </Tooltip>
        )}
      </>
    );
};

export default SpeechToText;