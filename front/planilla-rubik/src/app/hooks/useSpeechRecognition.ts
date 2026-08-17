// 'use client';

// import { useState, useEffect, useRef, useCallback } from 'react';

// // Definimos el tipo para la API, que puede no estar presente en window
// interface ISpeechRecognition extends EventTarget {
//   continuous: boolean;
//   interimResults: boolean;
//   lang: string;
//   start(): void;
//   stop(): void;
//   onresult: (event: any) => void;
//   onerror: (event: any) => void;
//   onend: () => void;
// }

// // Obtenemos la clase del navegador una sola vez
// const SpeechRecognitionAPI = (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;

// export const useSpeechRecognition = (lang = 'es-ES') => {
//   const [transcript, setTranscript] = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const recognitionRef = useRef<ISpeechRecognition | null>(null);

//   // Efecto para inicializar la instancia de reconocimiento
//   useEffect(() => {
//     if (!SpeechRecognitionAPI) {
//       console.warn('SpeechRecognition API no es compatible con este navegador.');
//       return;
//     }

//     // Creamos la instancia una sola vez y la guardamos en la referencia
//     recognitionRef.current = new SpeechRecognitionAPI();
    
//     // Función de limpieza para detener el reconocimiento si el componente se desmonta
//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, []); // El array vacío asegura que esto se ejecute solo una vez

//   // Función para iniciar la escucha
//   const start = useCallback(() => {
//     // ---- CORRECCIÓN AQUÍ ----
//     // Añadimos una comprobación para asegurar que recognitionRef.current no sea null
//     if (!recognitionRef.current || isListening) {
//       return;
//     }

//     const recognition = recognitionRef.current;
    
//     // Configuramos los manejadores de eventos justo antes de iniciar
//     recognition.lang = lang;
//     recognition.continuous = true;
//     recognition.interimResults = true;

//     recognition.onresult = (event) => {
//       let finalTranscript = '';
//       let interimTranscript = '';
//       for (let i = event.resultIndex; i < event.results.length; ++i) {
//         if (event.results[i].isFinal) {
//           finalTranscript += event.results[i][0].transcript;
//         } else {
//           interimTranscript += event.results[i][0].transcript;
//         }
//       }
//       setTranscript(finalTranscript || interimTranscript);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//       setTranscript('');
//     };

//     recognition.onerror = (event) => {
//       console.error(`Error en reconocimiento de voz: "${event.error}"`);
//       setIsListening(false);
//     };

//     setTranscript('');
//     recognition.start();
//     setIsListening(true);
    
//   }, [isListening, lang]);

//   // Función para detener la escucha
//   const stop = useCallback(() => {
//     // ---- Y CORRECCIÓN AQUÍ ----
//     if (recognitionRef.current && isListening) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//     }
//   }, [isListening]);

//   return {
//     transcript,
//     isListening,
//     start,
//     stop,
//     isSupported: !!SpeechRecognitionAPI,
//   };
// };

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Definimos el tipo para la API
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

const SpeechRecognitionAPI = (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;

export const useSpeechRecognition = (lang = 'es-ES') => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  // La referencia ahora solo guarda la instancia, no se modifica después de la creación
  const recognitionInstance = useRef<ISpeechRecognition | null>(null);

  // Efecto para crear y destruir la instancia
  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      console.warn('SpeechRecognition API no es compatible con este navegador.');
      return;
    }
    
    // Creamos la instancia y la guardamos
    recognitionInstance.current = new SpeechRecognitionAPI();
    
    // Función de limpieza que se ejecuta cuando el componente se desmonta
    return () => {
      if (recognitionInstance.current) {
        recognitionInstance.current.stop();
      }
    };
  }, []); // Se ejecuta solo una vez al montar

  const start = useCallback(() => {
    // ---- CORRECCIÓN CLAVE ----
    // Guardamos la referencia en una variable local.
    // TypeScript ahora sabe que si 'recognition' no es null, no cambiará a null dentro de esta función.
    const recognition = recognitionInstance.current;
    if (!recognition || isListening) {
      return;
    }

    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let tempFinal = '';
      let tempInterim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          tempFinal += event.results[i][0].transcript;
        } else {
          tempInterim += event.results[i][0].transcript;
        }
      }
      setTranscript(tempFinal || tempInterim);
      if (tempFinal) {
        setFinalTranscript(tempFinal);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error(`Error en reconocimiento de voz: "${event.error}"`);
      setIsListening(false);
    };

    setTranscript('');
    setFinalTranscript('');
    recognition.start();
    setIsListening(true);
  }, [isListening, lang]);

  const stop = useCallback(() => {
    const recognition = recognitionInstance.current;
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    transcript,
    finalTranscript,
    isListening,
    start,
    stop,
    isSupported: !!SpeechRecognitionAPI,
  };
};