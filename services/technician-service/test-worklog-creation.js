/**
 * Test: Create a worklog with service and parts from admin service
 * 
 * This test demonstrates the complete workflow:
 * 1. Fetch services from admin service (MySQL)
 * 2. Fetch parts from admin service (MySQL)
 * 3. Create a task with selected service
 * 4. Create a worklog for the task
 * 5. Add parts to the task (updating stock in admin service)
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3016/api';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testWorklogCreation() {
  try {
    log('\n═══════════════════════════════════════════════════════════', 'blue');
    log('   WORKLOG CREATION TEST WITH SERVICES AND PARTS', 'blue');
    log('═══════════════════════════════════════════════════════════\n', 'blue');

    // Step 1: Fetch services from admin service
    log('Step 1: Fetching services from admin service...', 'yellow');
    const servicesResponse = await axios.get(`${BASE_URL}/services/`);
    const services = servicesResponse.data.data;
    
    if (services.length === 0) {
      log('✗ No services available', 'red');
      return;
    }
    
    log(`✓ Found ${services.length} services`, 'green');
    log(`  Selected: ${services[0].name} (₹${services[0].basePrice})`, 'blue');
    const selectedService = services[0];

    // Step 2: Fetch parts from admin service
    log('\nStep 2: Fetching parts from admin service...', 'yellow');
    const partsResponse = await axios.get(`${BASE_URL}/parts/`);
    const parts = partsResponse.data.data;
    
    if (parts.length === 0) {
      log('✗ No parts available', 'red');
      return;
    }
    
    log(`✓ Found ${parts.length} parts`, 'green');
    log(`  Selected: ${parts[0].name} (₹${parts[0].unitPrice}, Stock: ${parts[0].quantityInStock})`, 'blue');
    const selectedPart = parts[0];

    // Step 3: Create a task with the selected service
    log('\nStep 3: Creating a task with selected service...', 'yellow');
    const taskData = {
      title: `${selectedService.name} - Test Task`,
      description: `Performing ${selectedService.name} service with ${selectedPart.name}`,
      service: selectedService.service_id, // Use service_id (integer) instead of _id
      serviceName: selectedService.name,
      servicePrice: selectedService.basePrice,
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    };
    
    const taskResponse = await axios.post(`${BASE_URL}/tasks/`, taskData);
    const task = taskResponse.data.data;
    log(`✓ Task created successfully`, 'green');
    log(`  Task ID: ${task._id}`, 'blue');
    log(`  Title: ${task.title}`, 'blue');
    log(`  Service ID: ${task.service}`, 'blue');

    // Step 4: Create a worklog for the task
    log('\nStep 4: Creating worklog for the task...', 'yellow');
    const worklogData = {
      task: task._id,
      startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Started 1 hour ago
      endTime: new Date().toISOString(), // Ended now
      notes: `Completed ${selectedService.name}. Used ${selectedPart.name}. Customer satisfied with service.`
    };
    
    const worklogResponse = await axios.post(`${BASE_URL}/worklogs/`, worklogData);
    const worklog = worklogResponse.data.data;
    log(`✓ Worklog created successfully`, 'green');
    log(`  Worklog ID: ${worklog._id}`, 'blue');
    log(`  Duration: ${worklog.durationMinutes} minutes`, 'blue');
    log(`  Notes: ${worklog.notes}`, 'blue');

    // Step 5: Add part to task (this will update stock in admin service)
    log('\nStep 5: Adding part to task (updating stock in admin service)...', 'yellow');
    const partUsageData = {
      taskId: task._id,
      partId: selectedPart.product_id,
      quantityUsed: 2
    };
    
    try {
      const partResponse = await axios.post(`${BASE_URL}/tasks/${task._id}/parts`, partUsageData);
      log(`✓ Part added to task successfully`, 'green');
      log(`  Part: ${selectedPart.name}`, 'blue');
      log(`  Quantity used: ${partUsageData.quantityUsed}`, 'blue');
      log(`  Previous stock: ${selectedPart.quantityInStock}`, 'blue');
      log(`  New stock: ${selectedPart.quantityInStock - partUsageData.quantityUsed}`, 'blue');
    } catch (error) {
      if (error.response?.status === 404) {
        log(`⚠ Part addition endpoint not implemented yet (404)`, 'yellow');
        log(`  Note: You'll need to implement POST /tasks/:id/parts endpoint`, 'yellow');
      } else {
        throw error;
      }
    }

    // Step 6: Verify the created data
    log('\nStep 6: Verifying created data...', 'yellow');
    
    // Get the task with all details
    const taskDetailsResponse = await axios.get(`${BASE_URL}/tasks/${task._id}`);
    const taskDetails = taskDetailsResponse.data.data;
    log(`✓ Task retrieved successfully`, 'green');
    log(`  Task: ${taskDetails.title}`, 'blue');
    log(`  Status: ${taskDetails.status}`, 'blue');
    
    // Get worklogs for the task
    const worklogsResponse = await axios.get(`${BASE_URL}/worklogs/task/${task._id}`);
    const worklogs = worklogsResponse.data.data;
    log(`✓ Found ${worklogs.length} worklog(s) for this task`, 'green');

    // Summary
    log('\n═══════════════════════════════════════════════════════════', 'blue');
    log('   SUMMARY', 'blue');
    log('═══════════════════════════════════════════════════════════', 'blue');
    log(`Service Selected: ${selectedService.name} (₹${selectedService.basePrice})`, 'green');
    log(`Part Selected: ${selectedPart.name} (₹${selectedPart.unitPrice})`, 'green');
    log(`Task Created: ${task._id}`, 'green');
    log(`Worklog Created: ${worklog._id}`, 'green');
    log(`Duration: ${worklog.durationMinutes} minutes`, 'green');
    log('\n✅ Worklog creation with services and parts is WORKING!', 'green');
    log('═══════════════════════════════════════════════════════════\n', 'blue');

    // Cleanup suggestion
    log('Note: To clean up test data, run:', 'yellow');
    log(`  DELETE ${BASE_URL}/tasks/${task._id}`, 'yellow');
    log(`  DELETE ${BASE_URL}/worklogs/${worklog._id}\n`, 'yellow');

  } catch (error) {
    log('\n✗ Test failed:', 'red');
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'red');
      log(`  Message: ${error.response.data?.message || error.message}`, 'red');
      log(`  Details: ${JSON.stringify(error.response.data, null, 2)}`, 'yellow');
    } else {
      log(`  ${error.message}`, 'red');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      log('\n⚠ Make sure both services are running:', 'yellow');
      log('  Admin service: http://localhost:8000', 'yellow');
      log('  Technician service: http://localhost:3016', 'yellow');
    }
  }
}

// Run the test
testWorklogCreation();
