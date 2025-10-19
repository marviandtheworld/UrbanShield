import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const thumbnailWidth = screenWidth - 32; // Account for padding
const thumbnailHeight = thumbnailWidth * 0.6; // 16:9 aspect ratio

interface MediaItem {
    id: string;
    file_url: string;
    thumbnail_url?: string;
    media_type: 'image' | 'video';
    file_size?: number;
    duration?: number;
    width?: number;
    height?: number;
    mime_type?: string;
}

interface MediaThumbnailProps {
    mediaItems: MediaItem[];
    onPress: () => void;
    maxThumbnails?: number;
}

export default function MediaThumbnail({ 
    mediaItems, 
    onPress, 
    maxThumbnails = 4 
}: MediaThumbnailProps) {
    const { colors } = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    if (!mediaItems || mediaItems.length === 0) {
        return null;
    }

    const displayItems = mediaItems.slice(0, maxThumbnails);
    const remainingCount = mediaItems.length - maxThumbnails;

    const handleImageLoad = () => {
        setLoading(false);
        setError(false);
    };

    const handleImageError = () => {
        setLoading(false);
        setError(true);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    return (
        <TouchableOpacity 
            style={[styles.container, { backgroundColor: colors.surface }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {displayItems.length === 1 ? (
                // Single media item - full width
                <View style={styles.singleMediaContainer}>
                    <Image
                        source={{ 
                            uri: displayItems[0].media_type === 'image' 
                                ? displayItems[0].file_url 
                                : (displayItems[0].thumbnail_url || displayItems[0].file_url)
                        }}
                        style={[styles.singleMedia, { height: thumbnailHeight }]}
                        resizeMode="cover"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />
                    
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    )}
                    
                    {error && (
                        <View style={styles.errorOverlay}>
                            <Ionicons name="alert-circle" size={24} color={colors.error} />
                        </View>
                    )}
                    
                    {displayItems[0].media_type === 'video' && (
                        <View style={styles.videoOverlay}>
                            <View style={styles.playButton}>
                                <Ionicons name="play" size={24} color="#fff" />
                            </View>
                            {displayItems[0].duration && (
                                <View style={styles.durationBadge}>
                                    <Text style={styles.durationText}>
                                        {formatDuration(displayItems[0].duration)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            ) : (
                // Multiple media items - grid layout
                <View style={styles.gridContainer}>
                    {displayItems.map((item, index) => (
                        <View key={item.id} style={styles.gridItem}>
                            <Image
                                source={{ 
                                    uri: item.media_type === 'image' 
                                        ? item.file_url 
                                        : (item.thumbnail_url || item.file_url)
                                }}
                                style={styles.gridImage}
                                resizeMode="cover"
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                            />
                            
                            {item.media_type === 'video' && (
                                <View style={styles.videoOverlay}>
                                    <Ionicons name="play" size={16} color="#fff" />
                                </View>
                            )}
                            
                            {index === maxThumbnails - 1 && remainingCount > 0 && (
                                <View style={styles.moreOverlay}>
                                    <Text style={styles.moreText}>+{remainingCount}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}
            
            {/* Media count and type indicator */}
            <View style={styles.infoOverlay}>
                <View style={styles.mediaInfo}>
                    <Ionicons 
                        name={displayItems[0].media_type === 'image' ? 'image' : 'videocam'} 
                        size={16} 
                        color="#fff" 
                    />
                    <Text style={styles.mediaCount}>
                        {mediaItems.length} {mediaItems.length === 1 ? 'item' : 'items'}
                    </Text>
                </View>
                
                {displayItems[0].file_size && (
                    <Text style={styles.fileSize}>
                        {formatFileSize(displayItems[0].file_size)}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 8,
    },
    singleMediaContainer: {
        position: 'relative',
    },
    singleMedia: {
        width: '100%',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        height: thumbnailHeight,
    },
    gridItem: {
        position: 'relative',
        width: '50%',
        height: '50%',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    errorOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    videoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    playButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    durationText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    moreOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    moreText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mediaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mediaCount: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    fileSize: {
        color: '#fff',
        fontSize: 10,
        opacity: 0.8,
    },
});


