#!/usr/bin/env node

/**
 * Backend API Test Script
 * Tests the backend server endpoints and WebSocket functionality
 */

import http from 'http';
import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3000';
const SOCKET_URL = BACKEND_URL;

console.log('🧪 Testing Dual LLM Conversation System Backend\n');
console.log('='.repeat(50));

// Test 1: Health Check
async function testHealthCheck() {
  console.log('\n1️⃣ Testing Health Check Endpoint...');
  return new Promise((resolve, reject) => {
    http.get(`${BACKEND_URL}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Health check passed:', data);
          resolve(true);
        } else {
          console.log('❌ Health check failed:', res.statusCode);
          reject(false);
        }
      });
    }).on('error', (err) => {
      console.log('❌ Health check error:', err.message);
      reject(false);
    });
  });
}

// Test 2: API Health Check
async function testAPIHealth() {
  console.log('\n2️⃣ Testing API Health Endpoint...');
  return new Promise((resolve, reject) => {
    http.get(`${BACKEND_URL}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ API health check passed:', data);
          resolve(true);
        } else {
          console.log('❌ API health check failed:', res.statusCode);
          reject(false);
        }
      });
    }).on('error', (err) => {
      console.log('❌ API health check error:', err.message);
      reject(false);
    });
  });
}

// Test 3: WebSocket Connection
async function testWebSocketConnection() {
  console.log('\n3️⃣ Testing WebSocket Connection...');
  return new Promise((resolve, reject) => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      timeout: 5000
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      console.log('❌ WebSocket connection timeout');
      reject(false);
    }, 5000);

    socket.on('connect', () => {
      clearTimeout(timeout);
      console.log('✅ WebSocket connected successfully');
      console.log('   Socket ID:', socket.id);
      socket.disconnect();
      resolve(true);
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      console.log('❌ WebSocket connection error:', error.message);
      reject(false);
    });
  });
}

// Test 4: WebSocket Events
async function testWebSocketEvents() {
  console.log('\n4️⃣ Testing WebSocket Events...');
  return new Promise((resolve, reject) => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket']
    });

    let eventsReceived = 0;
    const expectedEvents = ['conversation:state'];

    socket.on('connect', () => {
      console.log('   Connected, requesting conversation state...');
      socket.emit('conversation:getState');
    });

    socket.on('conversation:state', (data) => {
      eventsReceived++;
      console.log('✅ Received conversation:state event');
      console.log('   Data:', JSON.stringify(data, null, 2));
      socket.disconnect();
      if (eventsReceived >= expectedEvents.length) {
        resolve(true);
      }
    });

    socket.on('error', (error) => {
      console.log('❌ WebSocket error:', error);
      socket.disconnect();
      reject(false);
    });

    setTimeout(() => {
      if (eventsReceived < expectedEvents.length) {
        console.log('❌ Timeout waiting for events');
        socket.disconnect();
        reject(false);
      }
    }, 3000);
  });
}

// Run all tests
async function runTests() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'API Health', fn: testAPIHealth },
    { name: 'WebSocket Connection', fn: testWebSocketConnection },
    { name: 'WebSocket Events', fn: testWebSocketEvents }
  ];

  for (const test of tests) {
    try {
      await test.fn();
      results.passed++;
      results.tests.push({ name: test.name, status: '✅ PASSED' });
    } catch (error) {
      results.failed++;
      results.tests.push({ name: test.name, status: '❌ FAILED' });
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  results.tests.forEach(test => {
    console.log(`${test.status} - ${test.name}`);
  });
  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${results.passed + results.failed} tests`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log('='.repeat(50) + '\n');

  process.exit(results.failed > 0 ? 1 : 0);
}

// Check if backend is running first
http.get(`${BACKEND_URL}/health`, (res) => {
  if (res.statusCode === 200) {
    runTests().catch(err => {
      console.error('Test execution error:', err);
      process.exit(1);
    });
  } else {
    console.error('❌ Backend server is not running!');
    console.error('   Please start it with: cd backend && npm start');
    process.exit(1);
  }
}).on('error', (err) => {
  console.error('❌ Cannot connect to backend server!');
  console.error('   Error:', err.message);
  console.error('   Please start it with: cd backend && npm start');
  process.exit(1);
});

