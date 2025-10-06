import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import LocationService, { LocationData } from '../../lib/locationService';

interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface LocationSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
  currentLocation?: LocationData;
  searchRadius?: number; // in kilometers
}

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  visible,
  onClose,
  onLocationSelect,
  currentLocation,
  searchRadius = 10 // 10km radius by default
}) => {
  const { colors } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isWithinBounds, setIsWithinBounds] = useState(true);
  const [boundaryMessage, setBoundaryMessage] = useState('');
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const locationService = LocationService.getInstance();

  useEffect(() => {
    if (searchText.length >= 3) {
      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        searchPlaces(searchText);
      }, 500);
    } else {
      setSuggestions([]);
    }
  }, [searchText]);

  useEffect(() => {
    if (selectedLocation && currentLocation) {
      checkLocationBounds(selectedLocation, currentLocation);
    }
  }, [selectedLocation, currentLocation]);

  const searchPlaces = async (query: string) => {
    if (!currentLocation) return;
    
    setLoading(true);
    try {
      // Use Nominatim search API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&bounded=1&viewbox=${currentLocation.longitude - 0.1},${currentLocation.latitude - 0.1},${currentLocation.longitude + 0.1},${currentLocation.latitude + 0.1}`,
        {
          headers: {
            'User-Agent': 'UrbanShield/1.0',
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();
      
      const places: PlaceSuggestion[] = data.map((place: any, index: number) => {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          parseFloat(place.lat),
          parseFloat(place.lon)
        );

        return {
          id: `${place.place_id || index}`,
          name: place.display_name.split(',')[0] || 'Unknown Place',
          address: place.display_name,
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
          distance: Math.round(distance * 10) / 10
        };
      }).filter((place: PlaceSuggestion) => place.distance! <= searchRadius);

      setSuggestions(places);
    } catch (error) {
      console.error('Place search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const checkLocationBounds = (selected: LocationData, current: LocationData) => {
    const distance = calculateDistance(
      current.latitude,
      current.longitude,
      selected.latitude,
      selected.longitude
    );

    const withinBounds = distance <= searchRadius;
    setIsWithinBounds(withinBounds);
    
    if (withinBounds) {
      setBoundaryMessage(`✅ Within ${searchRadius}km of your location`);
    } else {
      setBoundaryMessage(`❌ Outside ${searchRadius}km radius. Please select a location near you to avoid fake news.`);
    }
  };

  const handleSuggestionSelect = (suggestion: PlaceSuggestion) => {
    const location: LocationData = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      address: suggestion.address
    };
    
    setSelectedLocation(location);
    setSearchText(suggestion.name);
    setSuggestions([]);
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    if (!isWithinBounds) {
      Alert.alert(
        'Location Too Far',
        `You can only report incidents within ${searchRadius}km of your current location to prevent fake news. Please select a nearby location.`,
        [{ text: 'OK' }]
      );
      return;
    }

    onLocationSelect(selectedLocation);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setSelectedLocation(currentLocation);
      setSearchText(currentLocation.address || `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`);
      setSuggestions([]);
    }
  };

  const renderSuggestion = ({ item }: { item: PlaceSuggestion }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleSuggestionSelect(item)}
    >
      <View style={styles.suggestionContent}>
        <Ionicons name="location" size={20} color={colors.primary} />
        <View style={styles.suggestionText}>
          <Text style={[styles.suggestionName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.suggestionAddress, { color: colors.secondary }]} numberOfLines={2}>
            {item.address}
          </Text>
          {item.distance && (
            <Text style={[styles.suggestionDistance, { color: colors.primary }]}>
              {item.distance}km away
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Select Location
          </Text>
          <TouchableOpacity 
            onPress={handleConfirm} 
            style={[styles.confirmButton, { backgroundColor: isWithinBounds ? colors.primary : colors.secondary }]}
            disabled={!selectedLocation || !isWithinBounds}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.secondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for a place..."
            placeholderTextColor={colors.secondary}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        {/* Boundary Message */}
        {selectedLocation && (
          <View style={[styles.boundaryMessage, { backgroundColor: isWithinBounds ? colors.success + '20' : colors.warning + '20' }]}>
            <Ionicons 
              name={isWithinBounds ? "checkmark-circle" : "warning"} 
              size={16} 
              color={isWithinBounds ? colors.success : colors.warning} 
            />
            <Text style={[styles.boundaryText, { color: isWithinBounds ? colors.success : colors.warning }]}>
              {boundaryMessage}
            </Text>
          </View>
        )}

        {/* Current Location Button */}
        {currentLocation && (
          <TouchableOpacity
            style={[styles.currentLocationButton, { backgroundColor: colors.primary + '20' }]}
            onPress={handleUseCurrentLocation}
          >
            <Ionicons name="locate" size={20} color={colors.primary} />
            <Text style={[styles.currentLocationText, { color: colors.primary }]}>
              Use Current Location
            </Text>
          </TouchableOpacity>
        )}

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsTitle, { color: colors.text }]}>
              Nearby Places
            </Text>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id}
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Info Message */}
        <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            You can only report incidents within {searchRadius}km of your location to prevent fake news and ensure accurate reporting.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

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
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  boundaryMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  boundaryText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  suggestionsContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  suggestionDistance: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default LocationSearchModal;


