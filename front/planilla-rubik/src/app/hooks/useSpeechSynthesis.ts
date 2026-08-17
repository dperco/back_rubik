'use client';

import { useState, useEffect, useCallback } from 'react';

// Opciones de configuración para la voz
interface SpeechOptions {
  lang?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

const useSpeechSynthesis = (options: SpeechOptions = {}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Comprobar si la API de Síntesis de Voz es compatible con el navegador
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return;

    // Detener cualquier habla anterior para evitar solapamientos
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurar la voz
    utterance.lang = options.lang || 'es-ES'; // Español de España por defecto
    utterance.pitch = options.pitch || 1;
    utterance.rate = options.rate || 1;
    utterance.volume = options.volume || 1;

    // Eventos para controlar el estado 'isSpeaking'
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, options]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, cancel, isSpeaking, isSupported };
};

export default useSpeechSynthesis;