import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

interface CreateIncidentModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

type Category = 'event' | 'general' | 'rescue' | 'safety' | 'maintenance' | 'security' | 'other';
type Severity = 'low' | 'medium' | 'high' | 'critical';

export default function CreateIncidentModal({
  visible,
  onClose,
  userId,
  onSuccess,
}: CreateIncidentModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Category & Severity
  const [category, setCategory] = useState<Category>('general');
  const [severity, setSeverity] = useState<Severity>('medium');

  // Step 2: Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  // Step 3: Media (simplified for now)
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const categories = [
    { value: 'event', label: 'Event', icon: 'calendar', color: '#3b82f6' },
    { value: 'general', label: 'General', icon: 'information-circle', color: '#737373' },
    { value: 'rescue', label: 'Rescue', icon: 'medical', color: '#ef4444' },
    { value: 'safety', label: 'Safety', icon: 'shield', color: '#f59e0b' },
    { value: 'maintenance', label: 'Maintenance', icon: 'construct', color: '#8b5cf6' },
    { value: 'security', label: 'Security', icon: 'lock-closed', color: '#ec4899' },
    { value: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: '#737373' },
  ];

  const severities = [
    { value: 'low', label: 'Low', description: 'Minor issue, not urgent', color: '#22c55e' },
    { value: 'medium', label: 'Medium', description: 'Needs attention soon', color: '#f59e0b' },
    { value: 'high', label: 'High', description: 'Important, requires prompt action', color: '#ef4444' },
    { value: 'critical', label: 'Critical', description: 'Emergency, immediate action needed', color: '#dc2626' },
  ];

  const resetForm = () => {
    setStep(1);
    setCategory('general');
    setSeverity('medium');
    setTitle('');
    setDescription('');
    setAddress('');
    setLandmark('');
    setIsAnonymous(false);
    setIsUrgent(false);
    setImageUrls([]);
  };

  const handleNext = () => {
    if (step === 1) {
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
      // For now, we'll use a default location (you'll need to implement location picker)
      // This is placeholder coordinates for demonstration
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          reporter_id: userId,
          title: title.trim(),
          description: description.trim(),
          category,
          severity,
          address: address.trim(),
          landmark: landmark.trim() || null,
          is_anonymous: isAnonymous,
          is_urgent: isUrgent || severity === 'critical',
          images: imageUrls.length > 0 ? imageUrls : null,
          // TODO: Add actual location from location picker
          location: `POINT(123.8854 10.3157)`, // Cebu City placeholder
          status: 'open',
        })
        .select();

      if (error) throw error;

      Alert.alert('Success', 'Your report has been submitted!');
      resetForm();
      onClose();
      onSuccess();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>What type of incident is this?</Text>
      <Text style={styles.stepDescription}>
        Select the category that best describes your report
      </Text>

      <View style={styles.categoriesGrid}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[
              styles.categoryCard,
              category === cat.value && styles.categoryCardActive,
            ]}
            onPress={() => setCategory(cat.value as Category)}
          >
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: category === cat.value ? cat.color : '#1a1a1a' },
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
                category === cat.value && styles.categoryLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.stepTitle, { marginTop: 32 }]}>How severe is it?</Text>
      <Text style={styles.stepDescription}>
        This helps prioritize the response
      </Text>

      {severities.map((sev) => (
        <TouchableOpacity
          key={sev.value}
          style={[
            styles.severityCard,
            severity === sev.value && styles.severityCardActive,
            { borderColor: severity === sev.value ? sev.color : '#262626' },
          ]}
          onPress={() => setSeverity(sev.value as Severity)}
        >
          <View
            style={[
              styles.severityIndicator,
              { backgroundColor: sev.color },
            ]}
          />
          <View style={styles.severityText}>
            <Text style={styles.severityLabel}>{sev.label}</Text>
            <Text style={styles.severityDescription}>{sev.description}</Text>
          </View>
          {severity === sev.value && (
            <Ionicons name="checkmark-circle" size={24} color={sev.color} />
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Tell us more</Text>
      <Text style={styles.stepDescription}>
        Provide details to help us understand the situation
      </Text>

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="Brief summary of the incident"
        placeholderTextColor="#525252"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />
      <Text style={styles.charCount}>{title.length}/100</Text>

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe what's happening in detail..."
        placeholderTextColor="#525252"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={6}
        maxLength={500}
      />
      <Text style={styles.charCount}>{description.length}/500</Text>

      <Text style={styles.label}>Location *</Text>
      <TextInput
        style={styles.input}
        placeholder="Street address or general area"
        placeholderTextColor="#525252"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Nearby Landmark (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Near SM City Mall"
        placeholderTextColor="#525252"
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
            color={isAnonymous ? '#ef4444' : '#737373'}
          />
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Post anonymously</Text>
            <Text style={styles.optionDescription}>
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
            color={isUrgent ? '#ef4444' : '#737373'}
          />
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Mark as urgent</Text>
            <Text style={styles.optionDescription}>
              This will notify nearby users immediately
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(1)}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButtonSmall}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Add photos or videos (Optional)</Text>
      <Text style={styles.stepDescription}>
        Visual evidence helps verify and resolve incidents faster
      </Text>

      <View style={styles.mediaUploadArea}>
        <Ionicons name="cloud-upload-outline" size={48} color="#525252" />
        <Text style={styles.uploadText}>Tap to upload media</Text>
        <Text style={styles.uploadSubtext}>
          Photos and videos up to 10MB each
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#737373" />
        <Text style={styles.infoText}>
          Media upload will be implemented with proper file handling. For now, you can submit without media.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Review your report</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Category:</Text>
          <Text style={styles.summaryValue}>
            {categories.find(c => c.value === category)?.label}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Severity:</Text>
          <Text style={[styles.summaryValue, { 
            color: severities.find(s => s.value === severity)?.color 
          }]}>
            {severities.find(s => s.value === severity)?.label}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Title:</Text>
          <Text style={styles.summaryValue} numberOfLines={2}>
            {title}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Location:</Text>
          <Text style={styles.summaryValue} numberOfLines={2}>
            {address}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(2)}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Create Report</Text>
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
                <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
              </View>
            </View>
            <TouchableOpacity onPress={() => {
              resetForm();
              onClose();
            }}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </View>
      </View>
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
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
    backgroundColor: '#262626',
  },
  stepDotActive: {
    backgroundColor: '#ef4444',
  },
  stepContent: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#737373',
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 64) / 3,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#262626',
    padding: 16,
    alignItems: 'center',
  },
  categoryCardActive: {
    borderColor: '#ef4444',
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
    color: '#737373',
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#fff',
  },
  severityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
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
    color: '#fff',
    marginBottom: 4,
  },
  severityDescription: {
    fontSize: 12,
    color: '#737373',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#525252',
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
    color: '#fff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#737373',
  },
  mediaUploadArea: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#262626',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#525252',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#737373',
    marginLeft: 8,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#737373',
    width: 80,
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  nextButton: {
    backgroundColor: '#ef4444',
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
    backgroundColor: '#ef4444',
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
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#ef4444',
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
});