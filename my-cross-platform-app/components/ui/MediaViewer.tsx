import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

interface MediaViewerProps {
    mediaItems: MediaItem[];
    visible: boolean;
    onClose: () => void;
    initialIndex?: number;
}

export default function MediaViewer({ 
    mediaItems, 
    visible, 
    onClose, 
    initialIndex = 0 
}: MediaViewerProps) {
    const { colors } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex);
            setError(null);
        }
    }, [visible, initialIndex]);

    const currentMedia = mediaItems[currentIndex];

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < mediaItems.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleImageError = () => {
        setError('Failed to load image');
        setLoading(false);
    };

    const handleImageLoad = () => {
        setLoading(false);
        setError(null);
    };

    const handleImageLoadStart = () => {
        setLoading(true);
        setError(null);
    };

    if (!visible || !currentMedia) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            animationType="fade"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background }]}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    
                    <Text style={[styles.counter, { color: colors.text }]}>
                        {currentIndex + 1} of {mediaItems.length}
                    </Text>
                    
                    <View style={styles.placeholder} />
                </View>

                {/* Media Content */}
                <View style={styles.mediaContainer}>
                    {currentMedia.media_type === 'image' ? (
                        <View style={styles.imageContainer}>
                            {loading && (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={colors.primary} />
                                </View>
                            )}
                            
                            <Image
                                source={{ uri: currentMedia.file_url }}
                                style={styles.mediaImage}
                                resizeMode="contain"
                                onLoadStart={handleImageLoadStart}
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                            />
                            
                            {error && (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={48} color={colors.error} />
                                    <Text style={[styles.errorText, { color: colors.text }]}>
                                        {error}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.videoContainer}>
                            <View style={styles.videoPlaceholder}>
                                <Ionicons name="play-circle" size={80} color={colors.primary} />
                                <Text style={[styles.videoText, { color: colors.text }]}>
                                    Video Preview
                                </Text>
                                <Text style={[styles.videoSubtext, { color: colors.secondary }]}>
                                    Tap to play video
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Navigation Controls */}
                {mediaItems.length > 1 && (
                    <>
                        {currentIndex > 0 && (
                            <TouchableOpacity
                                style={[styles.navButton, styles.prevButton]}
                                onPress={handlePrevious}
                            >
                                <Ionicons name="chevron-back" size={24} color="#fff" />
                            </TouchableOpacity>
                        )}
                        
                        {currentIndex < mediaItems.length - 1 && (
                            <TouchableOpacity
                                style={[styles.navButton, styles.nextButton]}
                                onPress={handleNext}
                            >
                                <Ionicons name="chevron-forward" size={24} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {/* Media Info */}
                <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.infoRow}>
                        <Ionicons 
                            name={currentMedia.media_type === 'image' ? 'image' : 'videocam'} 
                            size={20} 
                            color={colors.primary} 
                        />
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            {currentMedia.media_type === 'image' ? 'Photo' : 'Video'}
                        </Text>
                    </View>
                    
                    {currentMedia.file_size && (
                        <View style={styles.infoRow}>
                            <Ionicons name="document" size={20} color={colors.secondary} />
                            <Text style={[styles.infoText, { color: colors.secondary }]}>
                                {(currentMedia.file_size / 1024 / 1024).toFixed(1)} MB
                            </Text>
                        </View>
                    )}
                    
                    {currentMedia.duration && (
                        <View style={styles.infoRow}>
                            <Ionicons name="time" size={20} color={colors.secondary} />
                            <Text style={[styles.infoText, { color: colors.secondary }]}>
                                {Math.floor(currentMedia.duration / 60)}:{(currentMedia.duration % 60).toString().padStart(2, '0')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Thumbnail Strip */}
                {mediaItems.length > 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.thumbnailStrip}
                        contentContainerStyle={styles.thumbnailContainer}
                    >
                        {mediaItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.thumbnail,
                                    { 
                                        borderColor: index === currentIndex ? colors.primary : colors.border,
                                        backgroundColor: colors.surface
                                    }
                                ]}
                                onPress={() => setCurrentIndex(index)}
                            >
                                <Image
                                    source={{ 
                                        uri: item.media_type === 'image' 
                                            ? item.file_url 
                                            : (item.thumbnail_url || item.file_url)
                                    }}
                                    style={styles.thumbnailImage}
                                    resizeMode="cover"
                                />
                                {item.media_type === 'video' && (
                                    <View style={styles.videoOverlay}>
                                        <Ionicons name="play" size={16} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'ios' ? 50 : 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    closeButton: {
        padding: 8,
    },
    counter: {
        fontSize: 16,
        fontWeight: '600',
    },
    placeholder: {
        width: 40,
    },
    mediaContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaImage: {
        width: screenWidth,
        height: screenHeight * 0.7,
    },
    videoContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    videoText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    videoSubtext: {
        fontSize: 14,
        marginTop: 8,
    },
    loadingContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
    },
    navButton: {
        position: 'absolute',
        top: '50%',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -25,
    },
    prevButton: {
        left: 20,
    },
    nextButton: {
        right: 20,
    },
    infoContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        marginLeft: 8,
    },
    thumbnailStrip: {
        maxHeight: 80,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    thumbnailContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 2,
        overflow: 'hidden',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});


