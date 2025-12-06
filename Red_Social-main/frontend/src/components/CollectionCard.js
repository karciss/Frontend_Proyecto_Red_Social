import React from 'react';
import { useTheme } from '../context/ThemeContext';

const CollectionCard = ({ data, onClick }) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className="collection-card" 
      style={{ background: `linear-gradient(145deg, ${theme.colors.primaryDark}30, ${theme.colors.primaryLight}20)` }}
      onClick={() => onClick && onClick(data)}
    >
      <div className="card-header">
        <div className="user-info">
          <div className="user-avatar">
            <img src={data.userAvatar || "https://ui-avatars.com/api/?name=User&background=random"} alt={data.userName} />
          </div>
          <div className="user-name">{data.userName}</div>
        </div>
        <div className="card-actions">•••</div>
      </div>
      <div className="card-content">
        {data.image ? (
          <img src={data.image} alt={data.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ color: 'rgba(255, 255, 255, 0.5)' }}>🖼️</div>
        )}
      </div>
      <div className="card-footer">
        <div className="price-tag">{data.price} ETH</div>
        <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>{data.id}</div>
      </div>
    </div>
  );
};

export default CollectionCard;