/*
 * Author: Mike Liang 
 * Email: mlian031@uottawa.ca
 */

import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, RefreshCw, SkipForward } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Button } from './components/ui/button';
import { Slider } from './components/ui/slider';

const TypingSpeedApp = () => {
  const [inputText, setInputText] = useState('');
  const [sentencesArray, setSentencesArray] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [textOpacity, setTextOpacity] = useState(40);
  const [totalWordsTyped, setTotalWordsTyped] = useState(0);
  const inputRef = useRef(null);
  let timerRef = useRef(null);

  const currentSentence = sentencesArray[currentSentenceIndex] || '';

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSentenceIndex]);

  useEffect(() => {
    if (startTime && !completed) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [startTime, completed]);

  const handleInputTextChange = (e) => {
    const text = e.target.value;
    setInputText(text);
  };

  const handleInputSubmit = () => {
    const splitSentences = inputText.match(/[^.!?]+[.!?]+/g) || [];
    setSentencesArray(splitSentences.map(sentence => sentence.trim()));
    setInputText('');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (!startTime && value.length > 0) {
      setStartTime(new Date());
      setElapsedTime(0);
    }

    const wordsInInput = value.trim().split(/\s+/).filter(Boolean).length; 
    setTotalWordsTyped(wordsInInput);

    if (value.trim() === currentSentence.trim()) {
      const newMistakes = countMistakes(value.trim(), currentSentence.trim());
      setMistakes(mistakes + newMistakes);

      if (!practiceMode) {
        setCurrentSentenceIndex(currentSentenceIndex + 1);
      }
      setInput('');

      if (currentSentenceIndex + 1 >= sentencesArray.length && !practiceMode) {
        clearInterval(timerRef.current);
        setCompleted(true);
      }
    }
  };

  const countMistakes = (input, target) => {
    let mistakeCount = 0;
    for (let i = 0; i < Math.max(input.length, target.length); i++) {
      if (input[i] !== target[i]) {
        mistakeCount++;
      }
    }
    return mistakeCount;
  };

  const renderHighlightedText = () => {
    return currentSentence.split('').map((char, index) => {
      if (index >= input.length) {
        return <span key={index} style={{ opacity: textOpacity / 100 }}>{char}</span>;
      } else if (char !== input[index]) {
        return <span key={index} className="text-red-500">{char}</span>;
      } else {
        return <span key={index} className="text-gray-300">{char}</span>;
      }
    });
  };

  const calculateLiveWPM = () => {
    if (elapsedTime === 0) return 0;
    return Math.round((totalWordsTyped / elapsedTime) * 60);
  };

  const calculateFinalStats = () => {
    const totalTimeInSeconds = elapsedTime;
    const wordsPerMinute = Math.round((totalWordsTyped / totalTimeInSeconds) * 60);
    const totalChars = sentencesArray.join(' ').length;
    const accuracy = Math.round(((totalChars - mistakes) / totalChars) * 100);
    return { wordsPerMinute, accuracy };
  };

  const resetGame = () => {
    setInput('');
    setCurrentSentenceIndex(0);
    setStartTime(null);
    setElapsedTime(0);
    setMistakes(0);
    setCompleted(false);
    setPracticeMode(false);
    setTextOpacity(40);
    setTotalWordsTyped(0);
    clearInterval(timerRef.current);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const skipToNextSentence = () => {
    setCurrentSentenceIndex((prevIndex) => (prevIndex + 1) % sentencesArray.length);
    setInput('');
    setPracticeMode(true);
  };

  const handleOpacityChange = (value) => {
    setTextOpacity(value[0]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Typing Speed and Memorization</h1>

      {!sentencesArray.length ? (
        <div className="w-full max-w-2xl mb-4">
          <textarea
            value={inputText}
            onChange={handleInputTextChange}
            placeholder="Paste your text here..."
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white font-mono text-lg"
          />
          <Button
            onClick={handleInputSubmit}
            className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300"
          >
            Submit Text
          </Button>
        </div>
      ) : !completed ? (
        <>
          <div className="w-full max-w-2xl mb-4 font-mono text-lg">
            <p>{renderHighlightedText()}</p>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            className="w-full max-w-2xl p-2 bg-gray-800 border border-gray-700 rounded text-white font-mono text-lg"
            disabled={completed}
          />
          <div className="w-full max-w-2xl mt-4">
            <label htmlFor="opacity-slider" className="block text-sm font-medium text-gray-300 mb-2">
              Text Opacity: {textOpacity}%
            </label>
            <Slider
              id="opacity-slider"
              min={0}
              max={100}
              step={1}
              value={[textOpacity]}
              onValueChange={handleOpacityChange}
              className="w-full"
            />
          </div>
          <div className="mt-4 flex space-x-4">
            <Button onClick={skipToNextSentence} className="flex items-center">
              <SkipForward className="mr-2 h-4 w-4" /> Skip to Next Sentence
            </Button>
            {practiceMode && (
              <Button onClick={resetGame} className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4" /> Exit Practice Mode
              </Button>
            )}
          </div>
          <div className="mt-6 text-lg">
            <p>Live WPM: <span className="font-bold">{calculateLiveWPM()}</span></p>
          </div>
        </>
      ) : (
        <>
          <Alert className="w-full max-w-2xl mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Typing completed!</AlertTitle>
            <AlertDescription>
              <p>Words per minute: {calculateFinalStats().wordsPerMinute}</p>
              <p>Accuracy: {calculateFinalStats().accuracy}%</p>
            </AlertDescription>
          </Alert>
          <Button onClick={resetGame} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </>
      )}
    </div>
  );
};

export default TypingSpeedApp;

