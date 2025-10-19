import React from 'react';
import { Platform } from 'react-native';

// This component only renders on mobile platforms
// It dynamically imports MobileMapReal to avoid web import issues
const MobileMapWrapper: React.FC<any> = (props) => {
  if (Platform.OS === 'web') {
    // On web, return null to prevent any native imports
    return null;
  }

  // On mobile, dynamically import and render MobileMapReal
  try {
    const MobileMapReal = require('./MobileMapReal').default;
    return <MobileMapReal {...props} />;
  } catch (error) {
    console.warn('MobileMapReal not available, using fallback:', error);
    // Fallback to basic mobile map
    try {
      const MobileMap = require('./MobileMap').default;
      return <MobileMap {...props} />;
    } catch (fallbackError) {
      console.warn('MobileMap fallback also failed:', fallbackError);
      return null;
    }
  }
};


export default MobileMapWrapper;
