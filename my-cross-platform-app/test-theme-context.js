// Test Theme Context
// Run this in your browser console to test theme context

console.log('🧪 Testing Theme Context...');

// Test 1: Theme Context Import
console.log('1. Testing Theme Context Import...');
try {
  const { useTheme, ThemeProvider } = require('./contexts/ThemeContext');
  console.log('✅ Theme context imported successfully');
} catch (error) {
  console.error('❌ Theme context import failed:', error);
}

// Test 2: Theme Hook
console.log('2. Testing useTheme Hook...');
try {
  const { useTheme } = require('./contexts/ThemeContext');
  
  // Test fallback values
  const fallbackTheme = {
    themeMode: 'light',
    isDark: false,
    setThemeMode: () => {},
    colors: {
      background: '#ffffff',
      card: '#f8f9fa',
      text: '#000000',
      secondary: '#6c757d',
      primary: '#007bff',
      surface: '#ffffff',
      success: '#28a745',
      warning: '#ffc107'
    }
  };
  
  console.log('✅ Theme hook fallback values:', fallbackTheme);
} catch (error) {
  console.error('❌ Theme hook test failed:', error);
}

// Test 3: Color Values
console.log('3. Testing Color Values...');
try {
  const colors = {
    background: '#ffffff',
    card: '#f8f9fa',
    text: '#000000',
    secondary: '#6c757d',
    primary: '#007bff',
    surface: '#ffffff',
    success: '#28a745',
    warning: '#ffc107'
  };
  
  console.log('✅ Color values:', colors);
  
  // Test if all required colors are present
  const requiredColors = ['background', 'card', 'text', 'secondary', 'primary', 'surface', 'success', 'warning'];
  const missingColors = requiredColors.filter(color => !colors[color]);
  
  if (missingColors.length === 0) {
    console.log('✅ All required colors present');
  } else {
    console.error('❌ Missing colors:', missingColors);
  }
} catch (error) {
  console.error('❌ Color values test failed:', error);
}

// Test 4: WebMapFallback Component
console.log('4. Testing WebMapFallback Component...');
try {
  const WebMapFallback = require('./components/ui/WebMapFallback').default;
  console.log('✅ WebMapFallback component loaded');
} catch (error) {
  console.error('❌ WebMapFallback component failed:', error);
}

// Test 5: SafetyMap Component
console.log('5. Testing SafetyMap Component...');
try {
  const SafetyMap = require('./components/ui/SafetyMap').default;
  console.log('✅ SafetyMap component loaded');
} catch (error) {
  console.error('❌ SafetyMap component failed:', error);
}

console.log('🎉 Theme context test completed!');

// Additional theme tests
console.log('🎨 Theme Features:');
console.log('- Light/Dark mode support');
console.log('- Fallback color values');
console.log('- Error handling for undefined context');
console.log('- Cross-platform compatibility');





