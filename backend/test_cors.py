#!/usr/bin/env python3
"""
Simple script to test if the backend is running and CORS is working.
"""
import requests
import json

def test_backend():
    base_url = "http://localhost:8000"
    
    print("Testing backend connectivity...")
    
    # Test basic health check
    try:
        response = requests.get(f"{base_url}/api/v1/login/test-token", timeout=5)
        print(f"Health check status: {response.status_code}")
        if response.status_code == 422:
            print("✓ Backend is running (422 expected without auth token)")
        elif response.status_code == 200:
            print("✓ Backend is running and accessible")
        else:
            print(f"⚠ Backend responded with status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to backend - is it running?")
        return False
    except requests.exceptions.Timeout:
        print("✗ Backend request timed out")
        return False
    
    # Test CORS headers
    try:
        response = requests.options(f"{base_url}/api/v1/pdf/documents", 
                                  headers={
                                      'Origin': 'http://localhost:5173',
                                      'Access-Control-Request-Method': 'GET',
                                      'Access-Control-Request-Headers': 'authorization'
                                  })
        print(f"CORS preflight status: {response.status_code}")
        print("CORS headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
    except Exception as e:
        print(f"CORS test failed: {e}")
    
    # Test the actual PDF documents endpoint (without auth - should get 401)
    try:
        print("\nTesting PDF documents endpoint...")
        response = requests.get(f"{base_url}/api/v1/pdf/documents", timeout=5)
        print(f"PDF documents endpoint status: {response.status_code}")
        if response.status_code == 401:
            print("✓ PDF endpoint is working (401 expected without auth)")
        elif response.status_code == 500:
            print("✗ PDF endpoint has server error (500)")
            print(f"Response: {response.text}")
        else:
            print(f"PDF endpoint response: {response.status_code}")
    except Exception as e:
        print(f"PDF endpoint test failed: {e}")
    
    # Test login and authenticated access
    try:
        print("\nTesting login and authenticated access...")
        login_data = {
            "username": "admin@example.com",
            "password": "concat123"
        }
        
        login_response = requests.post(f"{base_url}/api/v1/login/access-token", 
                                     data=login_data, timeout=5)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            access_token = token_data.get('access_token')
            print("✓ Login successful")
            
            # Test authenticated PDF documents request
            auth_headers = {'Authorization': f'Bearer {access_token}'}
            auth_response = requests.get(f"{base_url}/api/v1/pdf/documents", 
                                       headers=auth_headers, timeout=5)
            print(f"Authenticated PDF documents status: {auth_response.status_code}")
            
            if auth_response.status_code == 200:
                documents = auth_response.json()
                print(f"✓ PDF documents endpoint working - found {len(documents)} documents")
            else:
                print(f"✗ Authenticated request failed: {auth_response.status_code}")
                print(f"Response: {auth_response.text}")
        else:
            print(f"✗ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            
    except Exception as e:
        print(f"Authentication test failed: {e}")
    
    return True

if __name__ == "__main__":
    test_backend()