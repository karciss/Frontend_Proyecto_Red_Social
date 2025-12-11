import React from 'react';
import CollectionCard from './CollectionCard';
import { useTheme } from '../context/ThemeContext';

const CollectionsSection = ({ onSelectItem, selectedTab = 'recent' }) => {
  const { theme } = useTheme();
  
  // Datos simulados para las colecciones
  const collections = [
    { 
      id: '231', 
      title: 'Robot Adventure',
      userName: 'Jackie Hong',
      userAvatar: 'https://ui-avatars.com/api/?name=Jackie+Hong&background=random',
      price: '0.21',
      image: 'https://picsum.photos/200/300?random=1'
    },
    { 
      id: '632', 
      title: 'Digital Collection',
      userName: 'Michael Paul',
      userAvatar: 'https://ui-avatars.com/api/?name=Michael+Paul&background=random',
      price: '0.31',
      image: 'https://picsum.photos/200/300?random=2'
    },
    { 
      id: '141', 
      title: 'Future World',
      userName: 'Julia Wang',
      userAvatar: 'https://ui-avatars.com/api/?name=Julia+Wang&background=random',
      price: '0.15',
      image: 'https://picsum.photos/200/300?random=3'
    },
    { 
      id: '293', 
      title: 'Cyber Art',
      userName: 'Alex Chen',
      userAvatar: 'https://ui-avatars.com/api/?name=Alex+Chen&background=random',
      price: '0.42',
      image: 'https://picsum.photos/200/300?random=4'
    }
  ];
  
  // Pestañas para filtrar
  const tabs = ['All history', 'From/To', 'Amount', 'Value', 'Date'];
  
  return (
    <div className="collections-section">
      <div className="collections-header">
        <h2 className="collections-title">Recent Collections</h2>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search NFT's, Collections" 
            className="search-input" 
          />
          <span className="search-icon">🔍</span>
        </div>
        <button 
          className="primary-button" 
          style={{ background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.primaryLight})` }}
        >
          Add NFT
        </button>
      </div>
      
      <div className="tab-selector">
        <div className="tab-item active">Creator</div>
        <div className="tab-item">Collector</div>
      </div>
      
      <div className="collections-grid">
        {collections.map((collection) => (
          <CollectionCard 
            key={collection.id} 
            data={collection} 
            onClick={() => onSelectItem({
              ...collection,
              userHandle: collection.userName.toLowerCase().replace(' ', '')
            })}
          />
        ))}
      </div>
    </div>
  );
};

export default CollectionsSection;