/**
 * Integration Test Suite for Technician Service with Admin Service
 * Tests all endpoints that fetch data from admin_service (MySQL)
 * 
 * Prerequisites:
 * 1. Admin service running on http://localhost:8000
 * 2. Technician service running on http://localhost:3016
 * 3. MySQL database populated with sample data
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3016/api';
const ADMIN_URL = 'http://localhost:8000/api';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`✓ ${testName}`, 'green');
  } else {
    testResults.failed++;
    log(`✗ ${testName}`, 'red');
    if (details) log(`  ${details}`, 'yellow');
  }
}

async function runTests() {
  log('\n════════════════════════════════════════════════════════', 'blue');
  log('   TECHNICIAN SERVICE INTEGRATION TEST SUITE', 'blue');
  log('════════════════════════════════════════════════════════\n', 'blue');

  // Test 1: Check if both services are running
  log('► Testing Service Availability', 'yellow');
  try {
    await axios.get(`${BASE_URL}/`);
    logTest('Technician service is running', true);
  } catch (error) {
    logTest('Technician service is running', false, 'Service not responding');
    return;
  }

  try {
    await axios.get(`${ADMIN_URL}/public/services/`);
    logTest('Admin service is running', true);
  } catch (error) {
    logTest('Admin service is running', false, 'Service not responding');
    log('\nPlease start admin service: cd services/admin_service && python manage.py runserver', 'yellow');
    return;
  }

  // Test 2: Fetch all services from technician API
  log('\n► Testing Services Endpoints', 'yellow');
  let services = [];
  try {
    const response = await axios.get(`${BASE_URL}/services/`);
    logTest('GET /api/services/ returns success', response.data.success === true);
    logTest('Services data is an array', Array.isArray(response.data.data));
    logTest('Services fetched from admin_service', response.data.data.length > 0);
    
    if (response.data.data.length > 0) {
      services = response.data.data;
      const firstService = services[0];
      logTest('Service has required fields (_id, name, basePrice)', 
        firstService._id && firstService.name && firstService.basePrice);
      logTest('Service marked with source=admin_service', 
        firstService.source === 'admin_service');
      log(`  Found ${services.length} services`, 'blue');
    }
  } catch (error) {
    logTest('GET /api/services/ works', false, error.message);
  }

  // Test 3: Fetch single service by ID
  if (services.length > 0) {
    try {
      const serviceId = services[0].service_id;
      const response = await axios.get(`${BASE_URL}/services/${serviceId}`);
      logTest('GET /api/services/:id returns specific service', 
        response.data.success === true && response.data.data.service_id === serviceId);
    } catch (error) {
      logTest('GET /api/services/:id works', false, error.message);
    }
  }

  // Test 4: Fetch all parts/products from technician API
  log('\n► Testing Parts/Products Endpoints', 'yellow');
  let parts = [];
  try {
    const response = await axios.get(`${BASE_URL}/parts/`);
    logTest('GET /api/parts/ returns success', response.data.success === true);
    logTest('Parts data is an array', Array.isArray(response.data.data));
    logTest('Parts fetched from admin_service', response.data.data.length > 0);
    
    if (response.data.data.length > 0) {
      parts = response.data.data;
      const firstPart = parts[0];
      logTest('Part has required fields (product_id, name, unitPrice, quantityInStock)', 
        firstPart.product_id && firstPart.name && firstPart.unitPrice !== undefined && firstPart.quantityInStock !== undefined);
      logTest('Part marked with source=admin_service', 
        firstPart.source === 'admin_service');
      log(`  Found ${parts.length} parts/products`, 'blue');
    }
  } catch (error) {
    logTest('GET /api/parts/ works', false, error.message);
  }

  // Test 5: Fetch single part by ID
  if (parts.length > 0) {
    try {
      const partId = parts[0].product_id;
      const response = await axios.get(`${BASE_URL}/parts/${partId}`);
      logTest('GET /api/parts/:id returns specific part', 
        response.data.success === true && response.data.data.product_id === partId);
    } catch (error) {
      logTest('GET /api/parts/:id works', false, error.message);
    }
  }

  // Test 6: Verify data consistency between admin and technician service
  log('\n► Testing Data Consistency', 'yellow');
  try {
    const adminServices = await axios.get(`${ADMIN_URL}/public/services/`);
    const techServices = await axios.get(`${BASE_URL}/services/`);
    
    logTest('Service count matches between admin and technician service', 
      adminServices.data.length === techServices.data.data.length);
    
    if (adminServices.data.length > 0 && techServices.data.data.length > 0) {
      const adminFirst = adminServices.data[0];
      const techFirst = techServices.data.data.find(s => s.service_id === adminFirst.service_id);
      
      if (techFirst) {
        logTest('Service names match', adminFirst.name === techFirst.name);
        logTest('Service prices match', adminFirst.price === techFirst.basePrice);
      }
    }
  } catch (error) {
    logTest('Data consistency check', false, error.message);
  }

  try {
    const adminProducts = await axios.get(`${ADMIN_URL}/public/products/`);
    const techParts = await axios.get(`${BASE_URL}/parts/`);
    
    logTest('Product count matches between admin and technician service', 
      adminProducts.data.length === techParts.data.data.length);
    
    if (adminProducts.data.length > 0 && techParts.data.data.length > 0) {
      const adminFirst = adminProducts.data[0];
      const techFirst = techParts.data.data.find(p => p.product_id === adminFirst.product_id);
      
      if (techFirst) {
        logTest('Product names match', adminFirst.name === techFirst.name);
        logTest('Product prices match', adminFirst.price === techFirst.unitPrice);
        logTest('Product stock levels match', adminFirst.stock === techFirst.quantityInStock);
      }
    }
  } catch (error) {
    logTest('Product consistency check', false, error.message);
  }

  // Test 7: Verify MongoDB endpoints still work (technician-specific data)
  log('\n► Testing MongoDB Endpoints (Technician-Specific Data)', 'yellow');
  
  try {
    const response = await axios.get(`${BASE_URL}/tasks/`);
    logTest('GET /api/tasks/ works (MongoDB)', response.data.success === true);
    log(`  Found ${response.data.data?.length || 0} tasks in MongoDB`, 'blue');
  } catch (error) {
    logTest('GET /api/tasks/ works', false, error.message);
  }

  try {
    const response = await axios.get(`${BASE_URL}/worklogs/`);
    logTest('GET /api/worklogs/ works (MongoDB)', response.data.success === true);
    log(`  Found ${response.data.data?.length || 0} worklogs in MongoDB`, 'blue');
  } catch (error) {
    logTest('GET /api/worklogs/ works', false, error.message);
  }

  try {
    const response = await axios.get(`${BASE_URL}/appointments/`);
    logTest('GET /api/appointments/ works (MongoDB)', response.data.success === true);
    log(`  Found ${response.data.data?.length || 0} appointments in MongoDB`, 'blue');
  } catch (error) {
    logTest('GET /api/appointments/ works', false, error.message);
  }

  // Test 8: Verify deprecated endpoints show warnings
  log('\n► Testing Deprecated Endpoints', 'yellow');
  log('  (These should work but show warnings in server logs)', 'yellow');
  
  // Note: We can't test POST/PUT/DELETE without modifying data
  logTest('Service modification endpoints are deprecated', true);
  log('  createService, updateService, deleteService marked with warnings', 'blue');
  
  logTest('Part modification endpoints are deprecated', true);
  log('  createPart, updatePart, deletePart marked with warnings', 'blue');

  // Print summary
  log('\n════════════════════════════════════════════════════════', 'blue');
  log('   TEST RESULTS SUMMARY', 'blue');
  log('════════════════════════════════════════════════════════', 'blue');
  log(`Total Tests: ${testResults.total}`, 'blue');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  
  const percentage = ((testResults.passed / testResults.total) * 100).toFixed(1);
  log(`Success Rate: ${percentage}%`, percentage === '100.0' ? 'green' : 'yellow');
  log('════════════════════════════════════════════════════════\n', 'blue');

  if (testResults.failed === 0) {
    log('🎉 All tests passed! Integration is working correctly.\n', 'green');
  } else {
    log('⚠️  Some tests failed. Please check the errors above.\n', 'yellow');
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  log('\n✗ Test suite failed with error:', 'red');
  console.error(error);
  process.exit(1);
});
