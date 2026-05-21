import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, X, Send } from 'lucide-react';
import './ChatBot.css';

const CHAT_SERVICE_URL = 'http://localhost:3011'; // AI Service

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(() => {
    return sessionStorage.getItem('chatbot_open') === 'true';
  });
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('chatbot_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    return sessionStorage.getItem('chatbot_session') || null;
  });
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Save state to sessionStorage (auto-clear when browser closes)
  useEffect(() => {
    sessionStorage.setItem('chatbot_open', isOpen);
  }, [isOpen]);

  useEffect(() => {
    sessionStorage.setItem('chatbot_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem('chatbot_session', sessionId);
    }
  }, [sessionId]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(CHAT_SERVICE_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to chat service');
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = `session_${Date.now()}`;
        setSessionId(currentSessionId);
      }
      newSocket.emit('join_conversation', { sessionId: currentSessionId });
    });

    newSocket.on('receive_message', (data) => {
      console.log('Received message data:', data);
      setIsTyping(false);
      if (data.success) {
        console.log('Products received:', data.data.products);
        console.log('Cart:', data.data.cart);
        console.log('Show checkout:', data.data.showCheckoutButton);
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.data.assistantMessage,
          products: data.data.products,
          cart: data.data.cart,
          showCheckoutButton: data.data.showCheckoutButton,
          timestamp: new Date()
        }]);
      }
    });

    newSocket.on('error', (data) => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: new Date()
      }]);
    });

    return () => newSocket.close();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Xin chào! 👋 Tôi là trợ lý AI của PetFood. Tôi có thể giúp bạn:\n\n• Tìm kiếm sản phẩm\n• Kiểm tra giá và tồn kho\n• Đặt hàng nhanh chóng\n\nBạn cần tôi giúp gì?',
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socket || !sessionId) return;

    const userMessage = inputMessage.trim();
    
    // Add user message to UI
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    // Send to server
    socket.emit('send_message', {
      sessionId,
      message: userMessage,
      userId: 'guest_' + Date.now()
    });

    setInputMessage('');
    setIsTyping(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProductClick = (productId) => {
    // Open in new tab to keep chat open
    window.open(`/products/${productId}`, '_blank');
  };

  const handleQuickCheckout = (cart) => {
    if (!cart || cart.length === 0) return;
    
    // Add items to cart and navigate to checkout
    const cartData = cart.map(item => ({
      productId: item.product._id,
      quantity: item.quantity,
      name: item.product.name,
      price: item.product.price,
      image: item.product.imageUrl
    }));
    
    // Store in localStorage for checkout page
    localStorage.setItem('quick_checkout_cart', JSON.stringify(cartData));
    
    // Navigate to checkout
    window.location.href = '/checkout';
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-bot-button"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="chat-icon-wrapper">
            <MessageCircle size={28} />
            <MessageCircle size={20} className="chat-icon-overlay" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-bot-window">
          {/* Header */}
          <div className="chat-bot-header">
            <div className="chat-bot-header-content">
              <div className="chat-bot-avatar">
                🐾
              </div>
              <div>
                <h3 className="chat-bot-title">PetFood AI</h3>
                <p className="chat-bot-subtitle">Trợ lý thông minh</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="chat-bot-close"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-bot-messages">
            {messages.map((message, index) => (
              <div key={index}>
                <div
                  className={`chat-message ${message.role === 'user' ? 'chat-message-user' : 'chat-message-bot'}`}
                >
                  <div className="chat-message-content">
                    {message.content}
                  </div>
                  <div className="chat-message-time">
                    {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Product Cards */}
                {message.products && message.products.length > 0 && (
                  <div className="product-cards">
                    {message.products.map((product) => (
                      <div
                        key={product._id}
                        className="product-card"
                        onClick={() => handleProductClick(product._id)}
                      >
                        <div className="product-card-image">
                          <img
                            src={product.imageUrl || product.images?.[0] || 'https://via.placeholder.com/150?text=No+Image'}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="product-card-info">
                          <h4 className="product-card-name">{product.name}</h4>
                          <p className="product-card-price">
                            {product.price?.toLocaleString('vi-VN')}đ
                          </p>
                          {product.stock > 0 ? (
                            <span className="product-card-stock in-stock">
                              Còn {product.stock} sản phẩm
                            </span>
                          ) : (
                            <span className="product-card-stock out-of-stock">
                              Hết hàng
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Checkout Button */}
                {message.showCheckoutButton && message.cart && message.cart.length > 0 && (
                  <div className="quick-checkout-container">
                    <button
                      className="quick-checkout-button"
                      onClick={() => handleQuickCheckout(message.cart)}
                    >
                      🛒 Tạo đơn hàng nhanh ({message.cart.length} sản phẩm)
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-message chat-message-bot">
                <div className="chat-message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-bot-input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="chat-bot-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="chat-bot-send"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}