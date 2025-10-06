import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// import * as VideoThumbnails from 'expo-video-thumbnails';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import LocationService, { LocationData } from '../../lib/locationService';
import { supabase } from '../../lib/supabase';
import { UserType, getPostingPrivilege } from '../../lib/userTypes';
import LocationSearchModal from './LocationSearchModal';

const { width } = Dimensions.get('window');

interface CreateIncidentModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userType?: UserType;
  onSuccess: () => void;
}

type Category = 'crime' | 'fire' | 'accident' | 'flood' | 'landslide' | 'earthquake' | 'other';
type Severity = 'low' | 'medium' | 'high' | 'critical';

export default function CreateIncidentModal({
  visible,
  onClose,
  userId,
  userType = 'guest',
  onSuccess,
}: CreateIncidentModalProps) {
  const { isDark } = useTheme();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Category & Severity
  const [category, setCategory] = useState<Category | null>(null);
  const [severity, setSeverity] = useState<Severity>('medium');

  // Step 2: Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isRescue, setIsRescue] = useState(false);
  
  // Location
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // Step 3: Media
  const [mediaFiles, setMediaFiles] = useState<Array<{
    uri: string;
    type: 'image' | 'video';
    thumbnail?: string;
  }>>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const categories = [
    { value: 'crime', label: 'Crime-Krimen', sublabel: 'Theft, Public Disturbance', icon: 'shield', color: '#ef4444' },
    { value: 'fire', label: 'Fire-Sunog', sublabel: 'Fire incidents', icon: 'flame', color: '#ff6b35' },
    { value: 'accident', label: 'Accident', sublabel: 'Car, Traffic Accidents', icon: 'car', color: '#f59e0b' },
    { value: 'flood', label: 'Flood-Baha', sublabel: 'Flooding incidents', icon: 'water', color: '#3b82f6' },
    { value: 'landslide', label: 'Landslide', sublabel: 'Landslide incidents', icon: 'earth', color: '#8b5cf6' },
    { value: 'earthquake', label: 'Earthquake-Linog', sublabel: 'Earthquake incidents', icon: 'pulse', color: '#dc2626' },
    { value: 'other', label: 'Others-Uban', sublabel: 'Other incidents', icon: 'ellipsis-horizontal', color: '#737373' },
  ];

  // Location service instance
  const locationService = LocationService.getInstance();

  // Media handling functions
  const requestMediaPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos and videos.');
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    // Disabled - only camera capture allowed to prevent fake news
    Alert.alert(
      'Camera Only',
      'To prevent fake news and AI-generated content, only live camera capture is allowed. Please use the "Take Photo" or "Record Video" buttons.',
      [{ text: 'OK' }]
    );
  };

  const takePhoto = async () => {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return;

    try {
      // Web platform camera support
      if (Platform.OS === 'web') {
        // For web, we'll use the browser's camera API
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          const newMedia = {
            uri: asset.uri,
            type: 'image' as const,
          };

          setMediaFiles(prev => [...prev, newMedia]);
        }
      } else {
        // Mobile platform camera
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          const newMedia = {
            uri: asset.uri,
            type: 'image' as const,
          };

          setMediaFiles(prev => [...prev, newMedia]);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const recordVideo = async () => {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return;

    try {
      // Web platform camera support
      if (Platform.OS === 'web') {
        // For web, we'll use the browser's camera API
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          videoMaxDuration: 30, // 30 seconds max
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          const newMedia: {
            uri: string;
            type: 'image' | 'video';
            thumbnail?: string;
          } = {
            uri: asset.uri,
            type: 'video' as const,
          };

          // For videos, use the video URI as thumbnail for now
          newMedia.thumbnail = asset.uri;

          setMediaFiles(prev => [...prev, newMedia]);
        }
      } else {
        // Mobile platform camera
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          videoMaxDuration: 30, // 30 seconds max
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          const newMedia: {
            uri: string;
            type: 'image' | 'video';
            thumbnail?: string;
          } = {
            uri: asset.uri,
            type: 'video' as const,
          };

          // For videos, use the video URI as thumbnail for now
          newMedia.thumbnail = asset.uri;

          setMediaFiles(prev => [...prev, newMedia]);
        }
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMediaToSupabase = async (uri: string, mediaType: 'image' | 'video' = 'image'): Promise<string | null> => {
    try {
      setUploadingMedia(true);
      
      // Create a unique filename with proper extension
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const extension = mediaType === 'video' ? 'mp4' : 'jpg';
      const filename = `incident_media_${timestamp}_${randomId}.${extension}`;
      
      console.log('📤 Uploading media:', { uri, mediaType, filename });
      
      // Read the file
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Determine content type based on media type
      const contentType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
      
      console.log('📤 Upload details:', { filename, contentType, blobSize: blob.size });
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('incident-media')
        .upload(filename, blob, {
          contentType,
          upsert: false, // Don't overwrite existing files
        });

      if (error) {
        console.error('❌ Upload error:', error);
        console.error('❌ Error details:', error.message);
        return null;
      }

      console.log('✅ Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('incident-media')
        .getPublicUrl(filename);

      console.log('🔗 Public URL:', publicUrl);
      
      // Test if the URL is accessible
      try {
        const testResponse = await fetch(publicUrl, { method: 'HEAD' });
        if (testResponse.ok) {
          console.log('✅ URL is accessible');
          return publicUrl;
        } else {
          console.error('❌ URL not accessible:', testResponse.status);
          return null;
        }
      } catch (testError) {
        console.error('❌ URL test failed:', testError);
        return null;
      }
    } catch (error) {
      console.error('❌ Error uploading media:', error);
      return null;
    } finally {
      setUploadingMedia(false);
    }
  };

  // Get user location when modal opens
  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      // Skip location on web platform if not supported
      if (Platform.OS === 'web' && !navigator.geolocation) {
        console.warn('Geolocation not supported on this web browser');
        setLocationPermissionGranted(false);
        setLocationLoading(false);
        return;
      }

      const result = await locationService.getLocationWithAddress();
      
      if (result.granted && result.location) {
        setCurrentLocation(result.location);
        setSelectedLocation(result.location);
        setLocationPermissionGranted(true);
        
        // Set default address if not already set
        if (!address && result.location.address) {
          setAddress(result.location.address);
        }
        
        console.log('📍 Location obtained:', result.location);
      } else {
        console.warn('Location not available:', result.error);
        setLocationPermissionGranted(false);
      }
    } catch (error) {
      console.error('Location error:', error);
      setLocationPermissionGranted(false);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    setAddress(location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
    setShowLocationSearch(false);
  };

  const handleLocationSearch = () => {
    if (!currentLocation) {
      Alert.alert(
        'Location Required',
        'Please enable location access first to search for nearby places.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowLocationSearch(true);
  };

  const requestLocationPermission = async () => {
    const granted = await locationService.showLocationPermissionDialog();
    if (granted) {
      await getCurrentLocation();
    }
  };

  const severities = [
    { value: 'low', label: 'Low', description: 'Minor issue, not urgent', color: '#22c55e' },
    { value: 'medium', label: 'Medium', description: 'Needs attention soon', color: '#f59e0b' },
    { value: 'high', label: 'High', description: 'Important, requires prompt action', color: '#ef4444' },
    { value: 'critical', label: 'Critical', description: 'Emergency, immediate action needed', color: '#dc2626' },
  ];

  const resetForm = () => {
    setStep(1);
    setCategory(null);
    setSeverity('medium');
    setTitle('');
    setDescription('');
    setAddress('');
    setLandmark('');
    setIsAnonymous(false);
    setIsUrgent(false);
    setIsRescue(false);
    setMediaFiles([]);
    setUploadingMedia(false);
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate category and severity selection
      if (!category) {
        Alert.alert('Error', 'Please select an incident category');
        return;
      }
      if (!severity) {
        Alert.alert('Error', 'Please select a severity level');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!title.trim() || !description.trim()) {
        Alert.alert('Error', 'Please provide a title and description');
        return;
      }
      if (!address.trim()) {
        Alert.alert('Error', 'Please provide a location');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate form data before submission
      if (!category) {
        Alert.alert('Error', 'Please select an incident category');
        setLoading(false);
        return;
      }
      if (!severity) {
        Alert.alert('Error', 'Please select a severity level');
        setLoading(false);
        return;
      }
      if (!title.trim()) {
        Alert.alert('Error', 'Please provide a title');
        setLoading(false);
        return;
      }
      if (!description.trim()) {
        Alert.alert('Error', 'Please provide a description');
        setLoading(false);
        return;
      }
      if (!address.trim()) {
        Alert.alert('Error', 'Please provide a location');
        setLoading(false);
        return;
      }

      console.log('🚀 CreateIncidentModal: Starting submission...');
      console.log('📝 Form data:', {
        userId,
        userType,
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        address: address.trim(),
        landmark: landmark.trim(),
        isAnonymous,
        isUrgent,
        mediaFiles: mediaFiles.length
      });
      
      // Additional validation for category
      if (!category || category === null) {
        Alert.alert('Error', 'Please select a valid incident category');
        setLoading(false);
        return;
      }
      
      console.log('✅ Category validation passed:', category);
      console.log('🔍 Category type:', typeof category);
      console.log('🔍 Category value:', JSON.stringify(category));

      // Allow all users to post immediately (admin can verify later)
      const postingPrivilege = getPostingPrivilege(userType);
      console.log('📋 Posting privilege:', postingPrivilege);

      // Use selected location, current location, or fallback to Cebu City
      const locationToUse = selectedLocation || currentLocation;
      const locationString = locationToUse 
        ? `POINT(${locationToUse.longitude} ${locationToUse.latitude})`
        : `POINT(123.8854 10.3157)`; // Cebu City fallback
      
      console.log('📍 Using location:', selectedLocation ? 'Selected location' : currentLocation ? 'Current location' : 'Fallback location');
      
      // Upload media files if any
      let uploadedMediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        console.log('📸 Uploading media files...');
        for (const mediaFile of mediaFiles) {
          const uploadedUrl = await uploadMediaToSupabase(mediaFile.uri, mediaFile.type);
          if (uploadedUrl) {
            uploadedMediaUrls.push(uploadedUrl);
            console.log('✅ Media uploaded:', uploadedUrl);
          } else {
            console.error('❌ Failed to upload media:', mediaFile.uri);
          }
        }
        console.log('✅ Media upload complete:', uploadedMediaUrls.length, 'files uploaded');
      }
      
      const insertData = {
        reporter_id: userId,
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        address: address.trim(),
        landmark: landmark.trim() || null,
        is_anonymous: isAnonymous,
        is_urgent: isUrgent || severity === 'critical',
        images: uploadedMediaUrls.length > 0 ? uploadedMediaUrls : null,
        is_verified: false, // New incidents start as unverified
        views_count: 0, // Initialize views_count
        likes_count: 0, // Initialize likes_count
        shares_count: 0, // Initialize shares_count
        location: locationString,
        status: 'open',
      };

      console.log('💾 Inserting data:', insertData);
      console.log('🔍 Category in insertData:', insertData.category);
      console.log('🔍 Severity in insertData:', insertData.severity);

      const { data, error } = await supabase
        .from('incidents')
        .insert(insertData)
        .select();

      console.log('📊 Insert result:', { data, error });
      
      if (error) {
        console.error('❌ Detailed error info:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      }

      if (error) {
        console.error('❌ Insert error:', error);
        throw error;
      }

      console.log('✅ Insert successful:', data);

      const successMessage = 'Your report has been submitted and is now live! Admin can verify it later.';
      
      Alert.alert('Success', successMessage);
      resetForm();
      onClose();
      onSuccess();
    } catch (error) {
      console.error('❌ CreateIncidentModal: Submission failed:', error);
      Alert.alert('Error', `Failed to submit report: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => {
    const colors = Colors[isDark ? 'dark' : 'light'];
    
    return (
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>What type of incident is this?</Text>
        <Text style={[styles.stepDescription, { color: colors.secondary }]}>
          Select the category that best describes your report
        </Text>

        <View style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                category === cat.value && [styles.categoryCardActive, { borderColor: cat.color }],
              ]}
              onPress={() => {
                console.log('🎯 Category selected:', cat.value, 'Label:', cat.label);
                setCategory(cat.value as Category);
              }}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category === cat.value ? cat.color : colors.surface },
                ]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={24}
                  color={category === cat.value ? '#fff' : cat.color}
                />
              </View>
              <Text
                style={[
                  styles.categoryLabel,
                  { color: colors.text },
                  category === cat.value && styles.categoryLabelActive,
                ]}
              >
                {cat.label}
              </Text>
              <Text
                style={[
                  styles.categorySublabel,
                  { color: colors.secondary },
                ]}
              >
                {cat.sublabel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.stepTitle, { marginTop: 32, color: colors.text }]}>How severe is it?</Text>
        <Text style={[styles.stepDescription, { color: colors.secondary }]}>
          This helps prioritize the response
        </Text>

        {severities.map((sev) => (
          <TouchableOpacity
            key={sev.value}
            style={[
              styles.severityCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              severity === sev.value && [styles.severityCardActive, { borderColor: sev.color }],
            ]}
            onPress={() => {
              console.log('🎯 Severity selected:', sev.value, 'Label:', sev.label);
              setSeverity(sev.value as Severity);
            }}
          >
            <View
              style={[
                styles.severityIndicator,
                { backgroundColor: sev.color },
              ]}
            />
            <View style={styles.severityText}>
              <Text style={[styles.severityLabel, { color: colors.text }]}>{sev.label}</Text>
              <Text style={[styles.severityDescription, { color: colors.secondary }]}>{sev.description}</Text>
            </View>
            {severity === sev.value && (
              <Ionicons name="checkmark-circle" size={24} color={sev.color} />
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.primary }]} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderStep2 = () => {
    const colors = Colors[isDark ? 'dark' : 'light'];
    
    return (
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>Tell us more</Text>
        <Text style={[styles.stepDescription, { color: colors.secondary }]}>
          Provide details to help us understand the situation
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Brief summary of the incident"
          placeholderTextColor={colors.secondary}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        <Text style={[styles.charCount, { color: colors.secondary }]}>{title.length}/100</Text>

        <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Describe what's happening in detail..."
          placeholderTextColor={colors.secondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          maxLength={500}
        />
        <Text style={[styles.charCount, { color: colors.secondary }]}>{description.length}/500</Text>

        <Text style={[styles.label, { color: colors.text }]}>Location *</Text>
        <View style={styles.locationContainer}>
          <TextInput
            style={[styles.input, styles.locationInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Street address or general area"
            placeholderTextColor={colors.secondary}
            value={address}
            onChangeText={setAddress}
          />
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: locationPermissionGranted ? colors.primary : colors.secondary }]}
            onPress={locationPermissionGranted ? getCurrentLocation : requestLocationPermission}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <Ionicons name="refresh" size={20} color="#fff" />
            ) : (
              <Ionicons name="location" size={20} color="#fff" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={handleLocationSearch}
            disabled={!locationPermissionGranted}
          >
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {currentLocation && (
          <View style={[styles.locationInfo, { backgroundColor: colors.surface }]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={[styles.locationText, { color: colors.text }]}>
              Current location: {currentLocation.address || `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`}
            </Text>
          </View>
        )}
        
        {!locationPermissionGranted && (
          <View style={[styles.locationWarning, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="warning" size={16} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.warning }]}>
              Location access needed for accurate incident reporting
            </Text>
          </View>
        )}

        <Text style={[styles.label, { color: colors.text }]}>Nearby Landmark (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., Near SM City Mall"
          placeholderTextColor={colors.secondary}
          value={landmark}
          onChangeText={setLandmark}
        />

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setIsAnonymous(!isAnonymous)}
          >
            <Ionicons
              name={isAnonymous ? 'checkbox' : 'square-outline'}
              size={24}
              color={isAnonymous ? colors.primary : colors.secondary}
            />
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Post anonymously</Text>
              <Text style={[styles.optionDescription, { color: colors.secondary }]}>
                Your identity will be hidden from other users
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setIsUrgent(!isUrgent)}
          >
            <Ionicons
              name={isUrgent ? 'checkbox' : 'square-outline'}
              size={24}
              color={isUrgent ? colors.primary : colors.secondary}
            />
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Mark as urgent</Text>
              <Text style={[styles.optionDescription, { color: colors.secondary }]}>
                This will notify nearby users immediately
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setIsRescue(!isRescue)}
          >
            <Ionicons
              name={isRescue ? 'checkbox' : 'square-outline'}
              size={24}
              color={isRescue ? colors.warning : colors.secondary}
            />
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Rescue needed</Text>
              <Text style={[styles.optionDescription, { color: colors.secondary }]}>
                This incident requires rescue assistance
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => setStep(1)}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextButtonSmall, { backgroundColor: colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderStep3 = () => {
    const colors = Colors[isDark ? 'dark' : 'light'];
    
    return (
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>Capture photos or videos (Optional)</Text>
        <Text style={[styles.stepDescription, { color: colors.secondary }]}>
          Use your camera to capture real-time evidence. This helps verify incidents and prevents fake news.
        </Text>

        {/* Media Upload Buttons - Camera Only */}
        <View style={styles.mediaButtonsContainer}>
          <TouchableOpacity
            style={[styles.mediaButton, { backgroundColor: colors.primary }]}
            onPress={takePhoto}
            disabled={uploadingMedia}
          >
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.mediaButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mediaButton, { backgroundColor: colors.warning }]}
            onPress={recordVideo}
            disabled={uploadingMedia}
          >
            <Ionicons name="videocam" size={24} color="#fff" />
            <Text style={styles.mediaButtonText}>Record Video</Text>
          </TouchableOpacity>
        </View>

        {/* Media Preview */}
        {mediaFiles.length > 0 && (
          <View style={styles.mediaPreviewContainer}>
            <Text style={[styles.mediaPreviewTitle, { color: colors.text }]}>
              Selected Media ({mediaFiles.length})
            </Text>
            <View style={styles.mediaGrid}>
              {mediaFiles.map((media, index) => (
                <View key={index} style={[styles.mediaItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Image
                    source={{ uri: media.thumbnail || media.uri }}
                    style={styles.mediaThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.mediaOverlay}>
                    <View style={styles.mediaTypeIndicator}>
                      <Ionicons 
                        name={media.type === 'video' ? 'play-circle' : 'image'} 
                        size={16} 
                        color="#fff" 
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.removeMediaButton}
                      onPress={() => removeMedia(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Upload Status */}
        {uploadingMedia && (
          <View style={[styles.uploadStatusContainer, { backgroundColor: colors.info + '20' }]}>
            <Ionicons name="cloud-upload" size={20} color={colors.info} />
            <Text style={[styles.uploadStatusText, { color: colors.info }]}>
              Uploading media files...
            </Text>
          </View>
        )}

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: colors.info + '20' }]}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.secondary }]}>
            You can add up to 5 photos or videos captured with your camera. Max video length: 30 seconds. This ensures authentic, real-time evidence and prevents fake news.
          </Text>
        </View>

        {/* Fake News Prevention Note */}
        <View style={[styles.warningBox, { backgroundColor: colors.warning + '20' }]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.warning} />
          <Text style={[styles.warningText, { color: colors.warning }]}>
            📸 Camera Only: To prevent fake news and AI-generated content, only live camera capture is allowed. No gallery uploads or external files.
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Review your report</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Category:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {categories.find(c => c.value === category)?.label}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Severity:</Text>
            <Text style={[styles.summaryValue, { 
              color: severities.find(s => s.value === severity)?.color 
            }]}>
              {severities.find(s => s.value === severity)?.label}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Title:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={2}>
              {title}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Location:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={2}>
              {address}
            </Text>
          </View>
          {isRescue && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Rescue:</Text>
              <Text style={[styles.summaryValue, { color: colors.warning }]}>
                Rescue assistance needed
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => setStep(2)}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: colors.text }]}>Create Report</Text>
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, { backgroundColor: step >= 1 ? colors.primary : colors.border }]} />
                <View style={[styles.stepDot, { backgroundColor: step >= 2 ? colors.primary : colors.border }]} />
                <View style={[styles.stepDot, { backgroundColor: step >= 3 ? colors.primary : colors.border }]} />
              </View>
            </View>
            <TouchableOpacity onPress={() => {
              resetForm();
              onClose();
            }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </View>
      </View>
      
      <LocationSearchModal
        visible={showLocationSearch}
        onClose={() => setShowLocationSearch(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={currentLocation || undefined}
        searchRadius={10}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'flex-end',
  },
  content: {
    height: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepContent: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 64) / 3,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
  },
  categoryCardActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#fff',
  },
  categorySublabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  severityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
  },
  severityCardActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  severityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  severityText: {
    flex: 1,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  severityDescription: {
    fontSize: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  optionsContainer: {
    marginTop: 24,
    gap: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
  },
  mediaUploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 8,
    lineHeight: 18,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    width: 80,
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
    gap: 8,
  },
  nextButtonSmall: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationInput: {
    flex: 1,
  },
  locationButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  searchButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  locationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    flex: 1,
  },
  // Media upload styles
  mediaButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  mediaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  mediaPreviewContainer: {
    marginBottom: 20,
  },
  mediaPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  mediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 4,
  },
  mediaTypeIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  removeMediaButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    padding: 2,
  },
  uploadStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  uploadStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
});