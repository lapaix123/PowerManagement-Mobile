// Test script to verify login functionality
const ApiService = require('./src/services/api').default;

async function testLogin() {
  console.log('Starting login test...');
  
  // Test with the credentials from the issue description
  const credentials = {
    username: 'paci',
    password: 'paci@123'
  };
  
  console.log('Attempting login with:', credentials);
  
  try {
    const response = await ApiService.login(credentials);
    console.log('Login response:', response);
    
    if (response.success) {
      console.log('Login successful!');
      console.log('User:', response.user);
      console.log('Role:', response.role);
    } else {
      console.log('Login failed:', response.error);
    }
  } catch (error) {
    console.error('Unexpected error during login test:', error);
  }
  
  console.log('Login test completed.');
}

// Run the test
testLogin();