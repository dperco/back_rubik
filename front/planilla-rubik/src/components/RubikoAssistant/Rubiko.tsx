


// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import { Fab, Dialog, DialogTitle, DialogContent, TextField, IconButton, Avatar, Box, Typography, Paper, CircularProgress, Backdrop } from '@mui/material';
// import { SmartToy, Close, Send, VolumeUp, VolumeOff } from '@mui/icons-material';
// import { motion, AnimatePresence, Variants } from 'framer-motion';
// import { TransitionProps } from '@mui/material/transitions';
// import { io } from "socket.io-client";
// import useSpeechSynthesis from '@/app/hooks/useSpeechSynthesis';

// const socket = io("http://localhost:3900");

// // --- Componente de Transición para el Diálogo ---
// const dialogVariants: Variants = {
//   enter: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
//   exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } },
// };
// const Transition = React.forwardRef(function Transition(
//   props: TransitionProps & { children: React.ReactElement<any, any> },
//   ref: React.Ref<HTMLDivElement>,
// ) {
//   const { in: inProp, children } = props;
//   return (
//     <motion.div ref={ref} tabIndex={-1} variants={dialogVariants} initial="exit" animate={inProp ? 'enter' : 'exit'}>
//       {children}
//     </motion.div>
//   );
// });

// // <<< INTERFACES ACTUALIZADAS >>>
// // Esta interfaz define la estructura de la respuesta que esperamos de la IA
// interface AIResponseObject {
//     answer: string;
//     details?: string; // details es opcional
//     source?: string;
// }

// // La interfaz del mensaje ahora puede contener un string (para el usuario) o un objeto (para la IA)
// interface ChatMessage {
//     sender: 'user' | 'rubiko';
//     content: string | AIResponseObject; // <<< CAMBIO: de 'text' a 'content' para mayor claridad
// }

// const welcomeMessage: AIResponseObject = {
//     answer: "¡Hola! Soy Rubiko, tu asistente virtual. ¿En qué te puedo ayudar?"
// };

// export default function RubikoAssistant() {
//     const [open, setOpen] = useState(false);
//     const [messages, setMessages] = useState<ChatMessage[]>([]);
//     const [userInput, setUserInput] = useState('');
//     const [isTyping, setIsTyping] = useState(false);
//     const chatContentRef = useRef<HTMLDivElement>(null);
//     const [isMuted, setIsMuted] = useState(true);
//     const [showGreeting, setShowGreeting] = useState(false);
//     const { speak, cancel } = useSpeechSynthesis({ lang: 'es-MX' });

//     // Efecto para el saludo proactivo
//     useEffect(() => {
//         const greetingTimer = setTimeout(() => {
//             if (!document.hidden && !open) {
//                 setShowGreeting(true);
//             }
//         }, 3000);

//         const hideTimer = setTimeout(() => {
//             setShowGreeting(false);
//         }, 10000);

//         return () => {
//             clearTimeout(greetingTimer);
//             clearTimeout(hideTimer);
//         };
//     }, [open]);


//     // <<< LÓGICA DE SOCKETS Y VOZ (ACTUALIZADA) >>>
//     useEffect(() => {
//         // Ahora esperamos un objeto de tipo AIResponseObject
//         socket.on('rubiko:response', (responseObject: AIResponseObject) => {
//             // Creamos el nuevo mensaje para el estado
//             const rubikoResponse: ChatMessage = { sender: 'rubiko', content: responseObject };
//             setMessages(prev => [...prev, rubikoResponse]);
//             setIsTyping(false);

//             // Solo leemos en voz alta la respuesta principal ('answer')
//             if (!isMuted) {
//                 const textToSpeak = responseObject.answer.replace(/\*/g, '').replace(/#/g, '');
//                 speak(textToSpeak);
//             }
//         });

//         return () => { socket.off('rubiko:response'); };
//     }, [isMuted, speak]);

//     // LÓGICA DEL CHAT
//     useEffect(() => {
//         if (open && messages.length === 0) {
//             setIsTyping(true);
//             setTimeout(() => {
//                 const welcome: ChatMessage = { sender: 'rubiko', content: welcomeMessage };
//                 setMessages([welcome]);
//                 setIsTyping(false);
//                 if (!isMuted) {
//                     speak(welcomeMessage.answer);
//                 }
//             }, 1000);
//         }
//     }, [open, messages.length, isMuted, speak]);

//     useEffect(() => {
//         if (chatContentRef.current) {
//             chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
//         }
//     }, [messages, isTyping]);

//     const handleToggle = () => {
//         setOpen(!open);
//         cancel();
//         setShowGreeting(false);
//     };

//     const handleSendMessage = () => {
//         if (userInput.trim() === '' || isTyping) return;
//         const currentInput = userInput;
//         const newUserMessage: ChatMessage = { sender: 'user', content: currentInput }; // <<< CAMBIO
        
//         setMessages(prev => [...prev, newUserMessage]);
//         setUserInput('');
//         setIsTyping(true);

//         socket.emit('rubiko:message', currentInput);
//     };
   
//     return (
//         <>
//             <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
//                 <AnimatePresence>
//                     {showGreeting && !open && (
//                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
//                             <Paper elevation={8} sx={{ p: 2, borderRadius: '20px 20px 4px 20px', bgcolor: 'primary.main', color: 'white', maxWidth: '250px' }}>
//                                 <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                                     <motion.div animate={{ rotate: [0, 20, 0] }} transition={{ repeat: Infinity, repeatDelay: 1, duration: 0.8, ease: 'easeInOut' }} style={{ originX: "70%", originY: "70%" }}> 👋 </motion.div>
//                                     ¡Hola!
//                                 </Typography>
//                                 <Typography variant="body2" sx={{ mt: 1 }}> Soy Rubiko. Haz clic si necesitas ayuda. </Typography>
//                             </Paper>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>
//                 <AnimatePresence>
//                     {!open && (
//                         <motion.div initial={{ opacity: 0, y: 50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.5 }} transition={{ duration: 0.3, ease: 'easeOut' }} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
//                             <Fab color="primary" aria-label="chat-with-rubiko" onClick={handleToggle}> <SmartToy /> </Fab>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>
//             </Box>

//             <Dialog open={open} onClose={handleToggle} TransitionComponent={Transition} PaperProps={{ sx: { width: '400px', height: '600px', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'transparent' } }} BackdropComponent={Backdrop} BackdropProps={{ timeout: 200, }}>
//                 <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: 'primary.main', color: 'white' }}>
//                     <Avatar sx={{ bgcolor: 'secondary.main' }}><SmartToy /></Avatar> {'Asistente Rubiko'} <Box sx={{ flexGrow: 1 }} />
//                     <IconButton onClick={() => setIsMuted(!isMuted)} sx={{ color: 'white' }} aria-label={isMuted ? "activar voz" : "desactivar voz"}> {isMuted ? <VolumeOff /> : <VolumeUp />} </IconButton>
//                     <IconButton onClick={handleToggle} sx={{ color: 'white' }}> <Close /> </IconButton>
//                 </DialogTitle>
//                 <DialogContent dividers sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
//                     <Box ref={chatContentRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
//                         {/* <<< LÓGICA DE RENDERIZADO (ACTUALIZADA) >>> */}
//                         {messages.map((msg, index) => (
//                             <Box key={index} sx={{ alignSelf: msg.sender === 'rubiko' ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
//                                 <Paper elevation={2} sx={{ p: 1.5, borderRadius: msg.sender === 'rubiko' ? '20px 20px 20px 5px' : '20px 20px 5px 20px', bgcolor: msg.sender === 'rubiko' ? 'grey.200' : 'primary.light', color: msg.sender === 'rubiko' ? 'black' : 'white', }}>
//                                     {typeof msg.content === 'string' 
//                                         ? <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography> // Mensaje del usuario
//                                         : ( // Mensaje de Rubiko (objeto)
//                                             <div>
//                                                 <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content.answer}</Typography>
//                                                 {msg.content.details && (
//                                                     <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
//                                                         <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
//                                                             {msg.content.details}
//                                                         </Typography>
//                                                     </Box>
//                                                 )}
//                                             </div>
//                                         )
//                                     }
//                                 </Paper>
//                             </Box>
//                         ))}
//                         {isTyping && ( <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}> <Paper elevation={2} sx={{ p: 1.5, borderRadius: '20px 20px 20px 5px', bgcolor: 'grey.200', maxWidth: '30%', alignSelf: 'flex-start' }}> <CircularProgress size={20} /> </Paper> </motion.div> )}
//                     </Box>
//                     <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', backgroundColor: 'background.paper' }}>
//                         <TextField fullWidth variant="outlined" size="small" placeholder="Escribe tu mensaje..." value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} disabled={isTyping} />
//                         <IconButton color="primary" onClick={handleSendMessage} disabled={isTyping}> <Send /> </IconButton>
//                     </Box>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, TextField, IconButton, Avatar, Box, Typography, Paper, CircularProgress, Backdrop } from '@mui/material';
import { SmartToy, Close, Send, VolumeUp, VolumeOff, Mic, MicOff } from '@mui/icons-material';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { TransitionProps } from '@mui/material/transitions';
import { io } from "socket.io-client";
import useSpeechSynthesis from '@/app/hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '@/app/hooks/useSpeechRecognition';

const socket = io("http://localhost:3900");

// --- Componente de Transición (Definición Única y Correcta) ---
const dialogVariants: Variants = {
  enter: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } },
};
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<HTMLDivElement>,
) {
  const { in: inProp, children } = props;
  return (
    <motion.div ref={ref} tabIndex={-1} variants={dialogVariants} initial="exit" animate={inProp ? 'enter' : 'exit'}>
      {children}
    </motion.div>
  );
});
Object.assign(Transition, { displayName: 'Transition' });

// --- Interfaces y Constantes ---
interface ChatMessage {
    sender: 'user' | 'rubiko';
    text: string | JSX.Element;
}
const welcomeMessage = "¡Hola! Soy Rubiko, tu asistente virtual. ¿En qué te puedo ayudar?";

export default function RubikoAssistant() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [showGreeting, setShowGreeting] = useState(false);
    const chatContentRef = useRef<HTMLDivElement>(null);

    const { speak, cancel } = useSpeechSynthesis({ lang: 'es-MX' });
    const { transcript, finalTranscript, isListening, start, stop, isSupported } = useSpeechRecognition('es-ES');

    // --- Hooks de Efecto ---

    // Efecto para mostrar el texto mientras hablas
    useEffect(() => {
        setUserInput(transcript);
    }, [transcript]);

    // Efecto para ENVIAR el mensaje cuando terminas de hablar
    const handleSendMessageRef = useRef<(text?: string) => void>();
    handleSendMessageRef.current = (textToSend?: string) => {
        const currentInput = textToSend || userInput;
        if (currentInput.trim() === '' || isTyping) return;

        const newUserMessage: ChatMessage = { sender: 'user', text: currentInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        if (isListening) stop();
        setIsTyping(true);
        socket.emit('rubiko:message', { query: currentInput, history: [] });
    };

    useEffect(() => {
        if (finalTranscript) {
            handleSendMessageRef.current?.(finalTranscript);
        }
    }, [finalTranscript]);

    // Efecto para el saludo proactivo
    useEffect(() => {
        const greetingTimer = setTimeout(() => { if (!document.hidden && !open) { setShowGreeting(true); } }, 3000);
        const hideTimer = setTimeout(() => { setShowGreeting(false); }, 10000);
        return () => { clearTimeout(greetingTimer); clearTimeout(hideTimer); };
    }, [open]);

    // Efecto para escuchar las respuestas del backend
    useEffect(() => {
        socket.on('rubiko:response', (responseText: string) => {
            const cleanText = responseText.replace(/\*/g, '').replace(/#/g, '');
            const rubikoResponse: ChatMessage = { sender: 'rubiko', text: cleanText };
            setMessages(prev => [...prev, rubikoResponse]);
            setIsTyping(false);
            if (!isMuted) { speak(cleanText); }
        });
        return () => { socket.off('rubiko:response'); };
    }, [isMuted, speak]);

    // Efecto para el mensaje de bienvenida y auto-scroll
    useEffect(() => {
        if (open && messages.length === 0) {
            setIsTyping(true);
            setTimeout(() => {
                const welcome: ChatMessage = { sender: 'rubiko', text: welcomeMessage };
                setMessages([welcome]);
                setIsTyping(false);
                if (!isMuted) { speak(welcomeMessage); }
            }, 1000);
        }
        if (chatContentRef.current) {
            chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
        }
    }, [open, messages, isTyping, isMuted, speak]);
    
    const handleToggle = () => {
        const isOpening = !open;
        setOpen(isOpening);
        if (!isOpening) {
            cancel();
            stop();
            setMessages([]);
        }
        setShowGreeting(false);
    };

    const handleMicClick = () => {
        if (isListening) {
            stop();
        } else {
            start();
        }
    };
    
    return (
        <>
            <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <AnimatePresence>{showGreeting && !open && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}><Paper elevation={8} sx={{ p: 2, borderRadius: '20px 20px 4px 20px', bgcolor: 'primary.main', color: 'white', maxWidth: '250px' }}><Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><motion.div animate={{ rotate: [0, 20, 0] }} transition={{ repeat: Infinity, repeatDelay: 1, duration: 0.8, ease: 'easeInOut' }} style={{ originX: "70%", originY: "70%" }}>👋</motion.div>¡Hola!</Typography><Typography variant="body2" sx={{ mt: 1 }}>Soy Rubiko. Haz clic si necesitas ayuda.</Typography></Paper></motion.div>)}</AnimatePresence>
                <AnimatePresence>{!open && (<motion.div initial={{ opacity: 0, y: 50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.5 }} transition={{ duration: 0.3, ease: 'easeOut' }} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}><Fab color="primary" aria-label="chat-with-rubiko" onClick={handleToggle}><SmartToy /></Fab></motion.div>)}</AnimatePresence>
            </Box>
            <Dialog open={open} onClose={handleToggle} TransitionComponent={Transition} PaperProps={{ sx: { width: '400px', height: '600px', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'transparent' } }} BackdropComponent={Backdrop} BackdropProps={{ timeout: 200 }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, backgroundColor: 'primary.main', color: 'white' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}><SmartToy /></Avatar>
                    {'Asistente Rubiko'}
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton onClick={() => setIsMuted(!isMuted)} sx={{ color: 'white' }} aria-label={isMuted ? "activar voz" : "desactivar voz"}>{isMuted ? <VolumeOff /> : <VolumeUp />}</IconButton>
                    <IconButton onClick={handleToggle} sx={{ color: 'white' }}><Close /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
                    <Box ref={chatContentRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {messages.map((msg, index) => (<Box key={index} sx={{ alignSelf: msg.sender === 'rubiko' ? 'flex-start' : 'flex-end', maxWidth: '80%' }}><Paper elevation={2} sx={{ p: 1.5, borderRadius: msg.sender === 'rubiko' ? '20px 20px 20px 5px' : '20px 20px 5px 20px', bgcolor: msg.sender === 'rubiko' ? 'grey.200' : 'primary.light', color: msg.sender === 'rubiko' ? 'black' : 'white' }}>{typeof msg.text === 'string' ? <Typography variant="body2">{msg.text}</Typography> : msg.text}</Paper></Box>))}
                        {isTyping && ( <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}> <Paper elevation={2} sx={{ p: 1.5, borderRadius: '20px 20px 20px 5px', bgcolor: 'grey.200', maxWidth: '30%', alignSelf: 'flex-start' }}> <CircularProgress size={20} /> </Paper> </motion.div> )}
                    </Box>
                    <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', backgroundColor: 'background.paper' }}>
                        <TextField fullWidth variant="outlined" size="small" placeholder={isListening ? "Escuchando..." : "Escribe tu mensaje..."} value={userInput} onChange={(e) => { stop(); setUserInput(e.target.value); }} onKeyPress={(e) => e.key === 'Enter' && handleSendMessageRef.current?.()} disabled={isTyping} />
                        {isSupported && (<IconButton color={isListening ? 'error' : 'primary'} onClick={handleMicClick} disabled={isTyping}>{isListening ? <MicOff /> : <Mic />}</IconButton>)}
                        <IconButton color="primary" onClick={() => handleSendMessageRef.current?.()} disabled={isTyping || !userInput.trim()}><Send /></IconButton>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}