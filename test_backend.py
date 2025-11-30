#!/usr/bin/env python3
"""
Backend API Test Script
Tests the backend server endpoints and WebSocket functionality
"""

import requests
import socketio
import time
import sys

BACKEND_URL = 'http://localhost:3000'
SOCKET_URL = BACKEND_URL

def test_health_check():
    """Test health check endpoint"""
    print('\n1️⃣ Testing Health Check Endpoint...')
    try:
        response = requests.get(f'{BACKEND_URL}/health', timeout=5)
        if response.status_code == 200:
            print(f'✅ Health check passed: {response.json()}')
            return True
        else:
            print(f'❌ Health check failed: {response.status_code}')
            return False
    except Exception as e:
        print(f'❌ Health check error: {e}')
        return False

def test_api_health():
    """Test API health endpoint"""
    print('\n2️⃣ Testing API Health Endpoint...')
    try:
        response = requests.get(f'{BACKEND_URL}/api/health', timeout=5)
        if response.status_code == 200:
            print(f'✅ API health check passed: {response.json()}')
            return True
        else:
            print(f'❌ API health check failed: {response.status_code}')
            return False
    except Exception as e:
        print(f'❌ API health check error: {e}')
        return False

def test_websocket_connection():
    """Test WebSocket connection"""
    print('\n3️⃣ Testing WebSocket Connection...')
    try:
        sio = socketio.SimpleClient()
        sio.connect(SOCKET_URL, wait_timeout=5)
        print('✅ WebSocket connected successfully')
        print(f'   Socket ID: {sio.sid}')
        sio.disconnect()
        return True
    except Exception as e:
        print(f'❌ WebSocket connection error: {e}')
        return False

def test_websocket_events():
    """Test WebSocket events"""
    print('\n4️⃣ Testing WebSocket Events...')
    try:
        sio = socketio.SimpleClient()
        sio.connect(SOCKET_URL, wait_timeout=5)
        
        # Request conversation state
        sio.emit('conversation:getState')
        
        # Wait for response with longer timeout
        received = False
        timeout = time.time() + 5
        while time.time() < timeout:
            try:
                events = sio.receive(timeout=1)
                if events:
                    for event_name, data in events:
                        if event_name == 'conversation:state':
                            print('✅ Received conversation:state event')
                            print(f'   Data: {data}')
                            received = True
                            break
            except Exception:
                # Continue waiting
                pass
            if received:
                break
            time.sleep(0.1)
        
        sio.disconnect()
        
        if received:
            return True
        else:
            print('❌ Timeout waiting for events')
            return False
    except Exception as e:
        print(f'❌ WebSocket events error: {e}')
        return False

def main():
    print('🧪 Testing Dual LLM Conversation System Backend\n')
    print('=' * 50)
    
    # Check if backend is running
    try:
        response = requests.get(f'{BACKEND_URL}/health', timeout=2)
        if response.status_code != 200:
            print('❌ Backend server is not running!')
            print('   Please start it with: cd backend && python app.py')
            sys.exit(1)
    except Exception as e:
        print('❌ Cannot connect to backend server!')
        print(f'   Error: {e}')
        print('   Please start it with: cd backend && python app.py')
        sys.exit(1)
    
    # Run tests
    results = {
        'passed': 0,
        'failed': 0,
        'tests': []
    }
    
    tests = [
        ('Health Check', test_health_check),
        ('API Health', test_api_health),
        ('WebSocket Connection', test_websocket_connection),
        ('WebSocket Events', test_websocket_events)
    ]
    
    for test_name, test_func in tests:
        try:
            if test_func():
                results['passed'] += 1
                results['tests'].append({'name': test_name, 'status': '✅ PASSED'})
            else:
                results['failed'] += 1
                results['tests'].append({'name': test_name, 'status': '❌ FAILED'})
        except Exception as e:
            results['failed'] += 1
            results['tests'].append({'name': test_name, 'status': f'❌ FAILED ({e})'})
    
    # Print summary
    print('\n' + '=' * 50)
    print('\n📊 Test Results Summary:')
    print('=' * 50)
    for test in results['tests']:
        print(f"{test['status']} - {test['name']}")
    print('\n' + '=' * 50)
    print(f"Total: {results['passed'] + results['failed']} tests")
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print('=' * 50 + '\n')
    
    sys.exit(0 if results['failed'] == 0 else 1)

if __name__ == '__main__':
    main()

