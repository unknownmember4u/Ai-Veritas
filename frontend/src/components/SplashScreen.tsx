import { useEffect, useState, useCallback } from 'react';

const ASCII_LOGO = `
    _    ___   __     _______ ____  ___ _____  _    ____  
   / \\  |_ _|  \\ \\   / / ____|  _ \\|_ _|_   _|/ \\  / ___| 
  / _ \\  | |    \\ \\ / /|  _| | |_) || |  | | / _ \\ \\___ \\ 
 / ___ \\ | |     \\ V / | |___|  _ < | |  | |/ ___ \\ ___) |
/_/   \\_\\___|     \\_/  |_____|_| \\_\\___| |_/_/   \\_\\____/ 
`;

const BOOT_MESSAGES = [
  '> Initializing neural verification engine...',
  '> Loading fact-checking protocols... [OK]',
  '> Connecting to truth database... [OK]',
  '> Calibrating confidence matrices... [OK]',
  '> Establishing secure channels... [OK]',
  '> System ready. Press any key to continue...',
];

interface MatrixChar {
  id: number;
  char: string;
  x: number;
  delay: number;
  duration: number;
}

const MatrixRain = () => {
  const [chars, setChars] = useState<MatrixChar[]>([]);
  
  useEffect(() => {
    const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const columns = Math.floor(window.innerWidth / 20);
    
    const newChars: MatrixChar[] = [];
    for (let i = 0; i < columns * 3; i++) {
      newChars.push({
        id: i,
        char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
        x: (i % columns) * 20,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 3,
      });
    }
    setChars(newChars);
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {chars.map((char) => (
        <span
          key={char.id}
          className="absolute text-neon-green text-xs"
          style={{
            left: char.x,
            top: -20,
            animation: `matrix-fall ${char.duration}s linear ${char.delay}s infinite`,
            textShadow: '0 0 10px hsl(var(--neon-green))',
          }}
        >
          {char.char}
        </span>
      ))}
    </div>
  );
};

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [displayedLogo, setDisplayedLogo] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);
  const [isTypingMessage, setIsTypingMessage] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  
  // Type out logo
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= ASCII_LOGO.length) {
        setDisplayedLogo(ASCII_LOGO.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setCurrentMessageIndex(0);
      }
    }, 5);
    
    return () => clearInterval(interval);
  }, []);
  
  // Type out boot messages
  useEffect(() => {
    if (currentMessageIndex < 0 || currentMessageIndex >= BOOT_MESSAGES.length) return;
    
    setIsTypingMessage(true);
    const message = BOOT_MESSAGES[currentMessageIndex];
    let charIndex = 0;
    
    const interval = setInterval(() => {
      if (charIndex <= message.length) {
        setDisplayedMessages(prev => {
          const newMessages = [...prev];
          newMessages[currentMessageIndex] = message.slice(0, charIndex);
          return newMessages;
        });
        charIndex++;
      } else {
        clearInterval(interval);
        setIsTypingMessage(false);
        
        // Move to next message after delay
        setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1);
        }, currentMessageIndex === BOOT_MESSAGES.length - 1 ? 0 : 300);
      }
    }, 20);
    
    return () => clearInterval(interval);
  }, [currentMessageIndex]);
  
  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleSkip = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(onComplete, 300);
  }, [isExiting, onComplete]);
  
  // Auto-complete or skip handling
  useEffect(() => {
    const handleKeyPress = () => handleSkip();
    const handleClick = () => handleSkip();
    
    window.addEventListener('keypress', handleKeyPress);
    window.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('click', handleClick);
    };
  }, [handleSkip]);
  
  return (
    <div 
      className={`fixed inset-0 z-50 bg-background flex flex-col items-center justify-center overflow-hidden transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
    >
      <MatrixRain />
      
      <div className="relative z-10 max-w-4xl w-full px-4">
        {/* ASCII Logo */}
        <pre className="text-primary text-glow-green text-[8px] sm:text-[10px] md:text-xs lg:text-sm leading-tight mb-8 whitespace-pre font-mono">
          {displayedLogo}
        </pre>
        
        {/* Boot Messages */}
        <div className="space-y-1 text-sm md:text-base">
          {displayedMessages.map((message, index) => (
            <div 
              key={index} 
              className={`font-mono ${
                message.includes('[OK]') 
                  ? 'text-primary' 
                  : 'text-foreground'
              }`}
            >
              {message}
              {index === currentMessageIndex && isTypingMessage && showCursor && (
                <span className="text-primary">█</span>
              )}
            </div>
          ))}
          
          {/* Final cursor */}
          {currentMessageIndex >= BOOT_MESSAGES.length && (
            <div className="text-primary mt-4">
              <span className={showCursor ? 'opacity-100' : 'opacity-0'}>█</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Skip hint */}
      <div className="absolute bottom-8 text-muted-foreground text-sm animate-pulse">
        Click or press any key to skip
      </div>
      
      {/* Scan lines overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" />
    </div>
  );
};
