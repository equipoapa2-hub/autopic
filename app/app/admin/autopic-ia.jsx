import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { API_URL } from '../../constants';

export default function AutoPicIA() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const scrollViewRef = useRef();

  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: '¡Hola. Soy AutoPic IA, un sistema de inteligencia artificial. Mi función es ayudarte a obtener información sobre usuarios, vehículos y sus usos. Aunque procuro ser preciso, puedo cometer errores o interpretar mal algunos datos. Indica qué necesitas y te apoyaré.',
        timestamp: new Date()
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          sessionId: sessionId
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          metadata: {
            needsDatabase: data.needsDatabase,
            sqlQuery: data.sqlQuery,
            results: data.results
          }
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta nuevamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch(`${API_URL}/ai/clear-context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId
        }),
      });
    } catch (error) {
      console.error('Error clearing context:', error);
    }

    setMessages([
      {
        id: Date.now(),
        type: 'assistant',
        content: '¡Conversación reiniciada! ¿En qué puedo ayudarte ahora?',
        timestamp: new Date()
      }
    ]);
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.type === 'user';
    const isError = message.type === 'error';

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.assistantMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          isError && styles.errorBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.assistantMessageText
          ]}>
            {message.content}
          </Text>
          <Text style={styles.timestamp}>
            {message.timestamp.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {message.metadata?.needsDatabase && (
          <View style={styles.metadataContainer}>
            <Text style={styles.metadataText}>
              📊 Consulta ejecutada en la base de datos
            </Text>
          </View>
        )}
      </View>
    );
  };

  const SuggestedQuestion = ({ question, onPress }) => (
    <TouchableOpacity style={styles.suggestionButton} onPress={onPress}>
      <Text style={styles.suggestionText}>{question}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Ionicons name="sparkles" size={28} color="#2CC295" />
            <Text style={styles.title}>AutoPic IA</Text>
          </View>
          <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.clearButtonText}>Reiniciar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Asistente inteligente para gestión de vehículos
        </Text>
      </View>

      <ScrollView
        style={styles.messagesContainer}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.assistantMessageContainer}>
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color="#2CC295" />
                  <Text style={styles.typingText}>AutoPic IA está pensando...</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Escribe tu pregunta aquí..."
            placeholderTextColor="#8e8e93"
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputMessage.trim() || loading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputMessage.trim() || loading}
          >
            <Ionicons
              name="send"
              size={20}
              color={!inputMessage.trim() || loading ? "#ccc" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    maxWidth: 1200,
    width: "100%",
    marginHorizontal: "auto"
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#17876D',
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2CC295',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#2CC295',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  errorBubble: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular'
  },
  userMessageText: {
    color: '#fff',
    fontFamily: 'Poppins-Regular'
  },
  assistantMessageText: {
    color: '#1a1a1a',
    fontFamily: 'Poppins-Regular'
  },
  timestamp: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 8,
    opacity: 0.7,
  },
  metadataContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2CC295',
  },
  metadataText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular'
  },
  loadingContainer: {
    marginBottom: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#8e8e93',
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular'
  },
  suggestionsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold'
  },
  suggestionsGrid: {
    gap: 8,
  },
  suggestionButton: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  suggestionText: {
    fontSize: 14,
    color: '#2CC295',
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    maxHeight: 100,
    paddingVertical: 8,
    outlineWidth: 0,
    fontFamily: 'Poppins-Regular'
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2CC295',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
});