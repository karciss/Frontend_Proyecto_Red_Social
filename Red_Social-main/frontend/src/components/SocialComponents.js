import React from 'react';
import { useTheme } from '../context/ThemeContext';

// Componente para publicaciones sociales - Estilo limpio como la imagen
export const SocialPost = ({ post, onLike, onComment, onShare }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #e5e5e5'
    }}>
      {/* Header del post con usuario */}
      <div style={{ display: 'flex', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '50%', 
          backgroundColor: theme.colors.primary,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px',
          fontWeight: '600',
          fontSize: '18px',
          flexShrink: 0
        }}>
          {post.avatarText || post.user.charAt(0)}
        </div>
        <div>
          <div style={{ 
            fontWeight: '700', 
            color: theme.colors.primary,
            fontSize: '15px',
            marginBottom: '2px'
          }}>
            {post.user}
          </div>
          <div style={{ 
            color: '#999', 
            fontSize: '13px' 
          }}>
            {post.time}
          </div>
        </div>
      </div>
      
      {/* Contenido del post */}
      <div style={{ 
        marginBottom: '16px', 
        lineHeight: '1.6',
        color: '#333',
        fontSize: '15px'
      }}>
        {post.content}
      </div>
      
      {/* Imagen si existe */}
      {post.image && (
        <div style={{ marginBottom: '16px' }}>
          <img 
            src={post.image} 
            alt="Contenido de la publicación" 
            style={{
              width: '100%',
              borderRadius: '6px',
              maxHeight: '400px',
              objectFit: 'cover'
            }}
          />
        </div>
      )}
      
      {/* Botones de interacción */}
      <div style={{ 
        display: 'flex', 
        gap: '24px',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0'
      }}>
        <button 
          onClick={() => onLike && onLike(post.id)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            color: post.liked ? theme.colors.primary : '#666',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            padding: '6px 12px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(139, 30, 65, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span style={{ marginRight: '6px', fontSize: '16px' }}>
            {post.liked ? '❤️' : '🤍'}
          </span>
          {post.likes}
        </button>
        
        <button 
          onClick={() => onComment && onComment(post.id)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            color: '#666',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            padding: '6px 12px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span style={{ marginRight: '6px' }}>Comentar</span>
        </button>
        
        <button 
          onClick={() => onShare && onShare(post.id)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            color: '#666',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            padding: '6px 12px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span style={{ marginRight: '6px' }}>Compartir</span>
        </button>
      </div>
      
      {post.showComments && (
        <div style={{ 
          marginTop: '15px',
          borderTop: `1px solid ${theme.colors.border}`,
          paddingTop: '15px'
        }}>
          {post.commentList && post.commentList.map((comment, index) => (
            <div key={index} style={{ 
              marginBottom: '10px',
              backgroundColor: `${theme.colors.background}`,
              padding: '10px',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '50%', 
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {comment.user.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{comment.user}</div>
                  <div style={{ fontSize: '0.7rem', color: theme.colors.textLight }}>{comment.time}</div>
                </div>
              </div>
              <div style={{ marginLeft: '40px' }}>{comment.content}</div>
            </div>
          ))}
          
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: theme.colors.primary,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '10px',
              fontWeight: 'bold'
            }}>
              YO
            </div>
            <input 
              type="text" 
              placeholder="Escribe un comentario..."
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '20px',
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.background
              }}
            />
            <button style={{
              marginLeft: '10px',
              backgroundColor: theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para crear una nueva publicación - Estilo limpio de la imagen
export const CreatePostForm = ({ onSubmit }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      padding: '24px',
      borderRadius: '8px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #e5e5e5'
    }}>
      <textarea 
        placeholder="¿Qué estás pensando?"
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          backgroundColor: '#f9f9f9',
          color: '#333',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: '15px',
          lineHeight: '1.6',
          outline: 'none',
          transition: 'border-color 0.2s, background-color 0.2s',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = theme.colors.primary;
          e.target.style.backgroundColor = '#ffffff';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e0e0e0';
          e.target.style.backgroundColor = '#f9f9f9';
        }}
      />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center',
        marginTop: '16px'
      }}>
        <button 
          onClick={onSubmit}
          style={{
            backgroundColor: theme.colors.primary,
            color: 'white',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '15px',
            transition: 'background-color 0.2s, transform 0.1s',
            boxShadow: '0 2px 4px rgba(139, 30, 65, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#6d1829';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(139, 30, 65, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(139, 30, 65, 0.2)';
          }}
        >
          Publicar
        </button>
      </div>
    </div>
  );
};

// Componente para mostrar chat grupal
export const GroupChat = ({ chat }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      backgroundColor: theme.colors.card,
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '500px'
    }}>
      <div style={{
        backgroundColor: theme.colors.primary,
        color: 'white',
        padding: '15px',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          backgroundColor: 'white',
          color: theme.colors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '15px',
          fontWeight: 'bold'
        }}>
          {chat.icon || '👥'}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{chat.name}</div>
          <div style={{ fontSize: '0.8rem' }}>{chat.participants} participantes</div>
        </div>
      </div>
      
      <div style={{
        flex: 1,
        padding: '15px',
        overflowY: 'auto',
        backgroundColor: theme.colors.background,
        borderBottom: `1px solid ${theme.colors.border}`
      }}>
        {chat.messages && chat.messages.map((message, index) => {
          const isMe = message.user === 'Yo';
          
          return (
            <div key={index} style={{
              display: 'flex',
              justifyContent: isMe ? 'flex-end' : 'flex-start',
              marginBottom: '10px'
            }}>
              {!isMe && (
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '50%', 
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}>
                  {message.user.charAt(0)}
                </div>
              )}
              
              <div style={{
                backgroundColor: isMe ? theme.colors.primary : theme.colors.card,
                color: isMe ? 'white' : theme.colors.text,
                padding: '10px 15px',
                borderRadius: '18px',
                maxWidth: '70%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {!isMe && (
                  <div style={{ fontWeight: 'bold', marginBottom: '3px', fontSize: '0.9rem' }}>
                    {message.user}
                  </div>
                )}
                <div>{message.text}</div>
                <div style={{ 
                  textAlign: 'right', 
                  fontSize: '0.7rem', 
                  marginTop: '3px',
                  opacity: 0.7
                }}>
                  {message.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{
        padding: '15px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <input 
          type="text" 
          placeholder="Escribe un mensaje..."
          style={{
            flex: 1,
            padding: '12px 15px',
            borderRadius: '20px',
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            fontSize: '1rem'
          }}
        />
        <button style={{
          marginLeft: '10px',
          backgroundColor: theme.colors.primary,
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '1.2rem'
        }}>
          →
        </button>
      </div>
    </div>
  );
};
