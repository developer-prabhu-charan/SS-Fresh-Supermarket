import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, MicOff, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';

// ------------------
// Speech Recognition Type Declarations
// ------------------
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognitionResultEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder,
  className = "",
  initialValue = ""
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isListening, setIsListening] = useState(false);
  const [showUnsupportedMessage, setShowUnsupportedMessage] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Sync with initialValue when it changes from outside
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSearchAndNavigate = useCallback((searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      // Call the parent's onSearch function
      onSearch(trimmedQuery);
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(trimmedQuery)}`);
    } else {
      // If query is empty, clear the search
      onSearch('');
      navigate('/products');
    }
  }, [onSearch, navigate]);

  // Check if SpeechRecognition API is available
  const SpeechRecognitionAPI: SpeechRecognitionConstructor | undefined =
    typeof window !== 'undefined' 
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : undefined;

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      console.error("SpeechRecognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'te' ? 'te-IN' : 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice recognition result:', transcript);
      setQuery(transcript);
      handleSearchAndNavigate(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        // ignore stop errors
      }
    };
  }, [language, SpeechRecognitionAPI, handleSearchAndNavigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchAndNavigate(query);
  };

  const toggleVoiceSearch = () => {
    if (!SpeechRecognitionAPI) {
      setShowUnsupportedMessage(true);
      setTimeout(() => setShowUnsupportedMessage(false), 3000);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    navigate('/products');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder={placeholder || t('search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-20 bg-secondary/50 border-border focus:ring-primary focus:border-primary"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <motion.div
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleVoiceSearch}
            className={`p-1 h-8 w-8 ${isListening ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {isListening ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <MicOff className="w-4 h-4" />
              </motion.div>
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-md p-3 shadow-card z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
              <span className="text-sm text-muted-foreground">
                {language === 'te' ? 'వింటోంది...' : 'Listening...'}
              </span>
            </div>
          </motion.div>
        )}
        {showUnsupportedMessage && (
          <motion.div
            className="absolute top-full mt-2 left-0 right-0 bg-red-100 border border-red-400 text-red-700 rounded-md p-3 shadow-card z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="text-sm">
              Voice search is not supported in this browser.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

export default SearchBar;