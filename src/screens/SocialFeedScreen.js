import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import FormInput from '../components/FormInput';

const SocialFeedScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // En producción, esto sería una llamada real a la API
      // const response = await apiService.social.getPosts();
      // setPosts(response.data);
      
      // Datos simulados para desarrollo
      setTimeout(() => {
        setPosts(generateMockPosts());
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    // Crear nueva publicación y actualizar estado
    const newPost = {
      id: Date.now().toString(),
      author: {
        id: user?.id || 'user-123',
        name: user?.nombre || 'Usuario de Prueba',
        avatar: null
      },
      content: newPostContent,
      type: postType,
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      liked_by_me: false
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const handleLikePost = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const liked = !post.liked_by_me;
        return {
          ...post,
          liked_by_me: liked,
          likes_count: liked ? post.likes_count + 1 : post.likes_count - 1
        };
      }
      return post;
    }));
  };

  // Función para generar datos simulados de publicaciones
  const generateMockPosts = () => {
    const mockPosts = [
      {
        id: '1',
        author: {
          id: 'user-456',
          name: 'Ana Martínez',
          avatar: null
        },
        content: 'Comparto mis apuntes de la clase de Algoritmos Avanzados. ¡Espero que les sirva para estudiar para el examen final!',
        type: 'academic',
        created_at: '2025-09-08T14:23:00Z',
        likes_count: 15,
        comments_count: 3,
        liked_by_me: false
      },
      {
        id: '2',
        author: {
          id: 'user-789',
          name: 'Carlos Rodríguez',
          avatar: null
        },
        content: '¿Alguien sabe si la próxima semana hay clase de Bases de Datos? El profesor mencionó algo sobre una conferencia.',
        type: 'text',
        created_at: '2025-09-08T10:45:00Z',
        likes_count: 3,
        comments_count: 8,
        liked_by_me: true
      },
      {
        id: '3',
        author: {
          id: 'user-123',
          name: 'Laura González',
          avatar: null
        },
        content: 'Recordatorio: Mañana es el último día para inscribirse en el hackathon universitario. ¡Anímense a participar!',
        type: 'text',
        created_at: '2025-09-07T16:30:00Z',
        likes_count: 27,
        comments_count: 5,
        liked_by_me: false
      }
    ];
    
    return mockPosts;
  };

  const renderPostTypeSelector = () => (
    <View style={styles.postTypeContainer}>
      <Button 
        title="Texto"
        onPress={() => setPostType('text')}
        variant={postType === 'text' ? 'primary' : 'outline'}
        style={styles.postTypeButton}
      />
      <Button 
        title="Académico"
        onPress={() => setPostType('academic')}
        variant={postType === 'academic' ? 'primary' : 'outline'}
        style={styles.postTypeButton}
      />
    </View>
  );

  const renderNewPostForm = () => (
    <Card style={styles.newPostCard}>
      <Text style={[styles.newPostTitle, { color: theme.colors.text }]}>
        Crear nueva publicación
      </Text>
      <FormInput
        placeholder="¿Qué estás pensando?"
        value={newPostContent}
        onChangeText={setNewPostContent}
        multiline
        numberOfLines={3}
      />
      {renderPostTypeSelector()}
      <Button
        title="Publicar"
        onPress={handleCreatePost}
        disabled={!newPostContent.trim()}
        fullWidth
      />
    </Card>
  );

  const renderPost = (post) => (
    <Card
      key={post.id}
      style={styles.postCard}
      contentStyle={styles.postContent}
    >
      <View style={styles.postHeader}>
        <View style={styles.postAuthor}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '40' }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {post.author.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.authorName, { color: theme.colors.text }]}>
              {post.author.name}
            </Text>
            <Text style={[styles.postTime, { color: theme.colors.secondary }]}>
              {new Date(post.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        {post.type === 'academic' && (
          <View style={[styles.postType, { backgroundColor: theme.colors.info + '30' }]}>
            <Text style={[styles.postTypeText, { color: theme.colors.info }]}>
              Académico
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.postText, { color: theme.colors.text }]}>
        {post.content}
      </Text>
      
      <View style={styles.postActions}>
        <Button
          title={`${post.likes_count} Me gusta`}
          onPress={() => handleLikePost(post.id)}
          variant={post.liked_by_me ? 'primary' : 'outline'}
          style={styles.actionButton}
        />
        <Button
          title={`${post.comments_count} Comentarios`}
          onPress={() => {/* Navegación a detalle de post */}}
          variant="text"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.pageTitle, { color: theme.colors.text }]}>
        Feed Social
      </Text>

      {renderNewPostForm()}

      {loading ? (
        <Text style={[styles.loadingText, { color: theme.colors.secondary }]}>
          Cargando publicaciones...
        </Text>
      ) : (
        <View style={styles.postsContainer}>
          {posts.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>
              No hay publicaciones disponibles
            </Text>
          ) : (
            posts.map(post => renderPost(post))
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  newPostCard: {
    marginBottom: 24,
  },
  newPostTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  postTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  postTypeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  postsContainer: {
    marginBottom: 16,
  },
  postCard: {
    marginBottom: 16,
  },
  postContent: {
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
  },
  postType: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  postTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  postText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    marginRight: 16,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
  },
});

export default SocialFeedScreen;
