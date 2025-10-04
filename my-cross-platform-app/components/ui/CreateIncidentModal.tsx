import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { UserType, canPostImmediately, getPostingPrivilege } from '../../lib/userTypes';

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
  const [category, setCategory] = useState<Category>('other');
  const [severity, setSeverity] = useState<Severity>('medium');

  // Step 2: Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isRescue, setIsRescue] = useState(false);

  // Step 3: Media (simplified for now)
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const categories = [
    { value: 'crime', label: 'Crime-Krimen', sublabel: 'Theft, Public Disturbance', icon: 'shield', color: '#ef4444' },
    { value: 'fire', label: 'Fire-Sunog', sublabel: 'Fire incidents', icon: 'flame', color: '#ff6b35' },
    { value: 'accident', label: 'Accident', sublabel: 'Car, Traffic Accidents', icon: 'car', color: '#f59e0b' },
    { value: 'flood', label: 'Flood-Baha', sublabel: 'Flooding incidents', icon: 'water', color: '#3b82f6' },
    { value: 'landslide', label: 'Landslide', sublabel: 'Landslide incidents', icon: 'earth', color: '#8b5cf6' },
    { value: 'earthquake', label: 'Earthquake-Linog', sublabel: 'Earthquake incidents', icon: 'pulse', color: '#dc2626' },
    { value: 'other', label: 'Others', sublabel: 'Other incidents', icon: 'ellipsis-horizontal', color: '#737373' },
  ];

  const severities = [
    { value: 'low', label: 'Low', description: 'Minor issue, not urgent', color: '#22c55e' },
    { value: 'medium', label: 'Medium', description: 'Needs attention soon', color: '#f59e0b' },
    { value: 'high', label: 'High', description: 'Important, requires prompt action', color: '#ef4444' },
    { value: 'critical', label: 'Critical', description: 'Emergency, immediate action needed', color: '#dc2626' },
  ];

  const resetForm = () => {
    setStep(1);
    setCategory('other');
    setSeverity('medium');
    setTitle('');
    setDescription('');
    setAddress('');
    setLandmark('');
    setIsAnonymous(false);
    setIsUrgent(false);
    setIsRescue(false);
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
      // Determine if post needs moderation based on user type
      const postingPrivilege = getPostingPrivilege(userType);
      const isApproved = canPostImmediately(userType);
      const isModerated = postingPrivilege === 'moderated';

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
          is_rescue: isRescue,
          images: imageUrls.length > 0 ? imageUrls : null,
          external_documents: userType === 'government' ? [] : null, // Government users can attach external docs
          is_moderated: isModerated,
          is_approved: isApproved,
          priority: userType === 'government' ? 1 : 0, // Government posts get priority
          // TODO: Add actual location from location picker
          location: `POINT(123.8854 10.3157)`, // Cebu City placeholder
          status: 'open',
        })
        .select();

      if (error) throw error;

      const successMessage = isApproved 
        ? 'Your report has been submitted and is now live!' 
        : 'Your report has been submitted for moderation. It will be reviewed before going live.';
      
      Alert.alert('Success', successMessage);
      resetForm();
      onClose();
      onSuccess();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
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
              onPress={() => setCategory(cat.value as Category)}
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
            onPress={() => setSeverity(sev.value as Severity)}
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
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Street address or general area"
          placeholderTextColor={colors.secondary}
          value={address}
          onChangeText={setAddress}
        />

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
        <Text style={[styles.stepTitle, { color: colors.text }]}>Add photos or videos (Optional)</Text>
        <Text style={[styles.stepDescription, { color: colors.secondary }]}>
          Visual evidence helps verify and resolve incidents faster
        </Text>

        <View style={[styles.mediaUploadArea, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="camera" size={48} color={colors.secondary} />
          <Text style={[styles.uploadText, { color: colors.text }]}>Take a live camera picture</Text>
          <Text style={[styles.uploadSubtext, { color: colors.secondary }]}>
            Tap to open camera and take a photo
          </Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.info + '20' }]}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.secondary }]}>
            Camera feature will be implemented with proper permissions. For now, you can submit without media.
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
});