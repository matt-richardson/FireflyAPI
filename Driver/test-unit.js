const Firefly = require('./firefly-api.js');

// Test data
const validXMLToken = `<token>
    <secret>test-secret-123</secret>
    <user username="testuser" fullname="Test User" email="test@example.com" role="student" guid="user-guid-123">
        <classes>
            <class guid="class-guid-1" name="Math" subject="Mathematics"/>
            <class guid="class-guid-2" name="Science" subject="Biology"/>
        </classes>
    </user>
</token>`;

const testCredentials = {
    deviceId: 'test-device-123',
    secret: 'test-secret-123',
    user: {
        username: 'testuser',
        fullname: 'Test User',
        email: 'test@example.com',
        role: 'student',
        guid: 'user-guid-123'
    },
    classes: [
        { guid: 'class-guid-1', name: 'Math', subject: 'Mathematics' },
        { guid: 'class-guid-2', name: 'Science', subject: 'Biology' }
    ]
};

async function runTests() {
    console.log('🧪 Running Firefly API Unit Tests\n');
    
    let passed = 0;
    let failed = 0;
    
    function test(name, fn) {
        try {
            fn();
            console.log(`✅ ${name}`);
            passed++;
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
            failed++;
        }
    }
    
    async function asyncTest(name, fn) {
        try {
            await fn();
            console.log(`✅ ${name}`);
            passed++;
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
            failed++;
        }
    }
    
    // Test 1: Class instantiation
    test('Firefly class instantiation with valid host', () => {
        const firefly = new Firefly('https://test.fireflycloud.net');
        if (!firefly.host) throw new Error('Host not set');
        if (firefly.appId !== 'Firefly Node.JS Driver') throw new Error('Default appId not set');
    });
    
    // Test 2: Class instantiation with custom appId
    test('Firefly class instantiation with custom appId', () => {
        const firefly = new Firefly('https://test.fireflycloud.net', 'Custom App');
        if (firefly.appId !== 'Custom App') throw new Error('Custom appId not set');
    });
    
    // Test 3: Invalid host should throw
    test('Firefly class throws with invalid host', () => {
        try {
            new Firefly();
            throw new Error('Should have thrown');
        } catch (error) {
            if (error.message === 'Should have thrown') throw error;
            // Expected error
        }
    });
    
    // Test 4: Device ID generation
    test('Device ID generation', () => {
        const firefly = new Firefly('https://test.fireflycloud.net');
        const deviceId = firefly.setDeviceId();
        if (!deviceId) throw new Error('Device ID not generated');
        if (firefly.deviceId !== deviceId) throw new Error('Device ID not stored');
    });
    
    // Test 5: Custom Device ID
    test('Custom Device ID setting', () => {
        const firefly = new Firefly('https://test.fireflycloud.net');
        const customId = 'custom-device-123';
        firefly.setDeviceId(customId);
        if (firefly.deviceId !== customId) throw new Error('Custom device ID not set');
    });
    
    // Test 6: Auth URL generation
    test('Authentication URL generation', () => {
        const firefly = new Firefly('https://test.fireflycloud.net');
        firefly.setDeviceId('test-device-123');
        const authUrl = firefly.authUrl;
        if (!authUrl.includes('https://test.fireflycloud.net/login/login.aspx')) {
            throw new Error('Auth URL format incorrect');
        }
        if (!authUrl.includes('test-device-123')) {
            throw new Error('Device ID not in auth URL');
        }
    });
    
    // Test 7: XML Authentication parsing
    test('XML authentication parsing', () => {
        const firefly = new Firefly('https://test.fireflycloud.net');
        firefly.completeAuthentication(validXMLToken);
        
        if (firefly.secret !== 'test-secret-123') throw new Error('Secret not parsed');
        if (firefly.user.username !== 'testuser') throw new Error('User not parsed');
        if (firefly._classes.length !== 2) throw new Error('Classes not parsed');
        if (firefly._classes[0].name !== 'Math') throw new Error('Class details not parsed');
    });
    
    // Test 8: Invalid XML should throw
    test('Invalid XML authentication throws', () => {
        const firefly = new Firefly('https://test.fireflycloud.net');
        try {
            firefly.completeAuthentication('invalid xml');
            throw new Error('Should have thrown');
        } catch (error) {
            if (error === 'Invalid xml') {
                // Expected
            } else if (error.message === 'Should have thrown') {
                throw error;
            }
        }
    });
    
    // Test 9: Export functionality
    test('Credentials export', () => {
        const firefly = new Firefly('https://test.fireflycloud.net');
        firefly.completeAuthentication(validXMLToken);
        
        const exported = JSON.parse(firefly.export);
        if (exported.secret !== 'test-secret-123') throw new Error('Export failed');
        if (exported.user.username !== 'testuser') throw new Error('User export failed');
    });
    
    // Test 10: Import functionality
    test('Credentials import', () => {
        const firefly = new Firefly('https://test.fireflycloud.net');
        const result = firefly.import(JSON.stringify(testCredentials));
        
        if (!result) throw new Error('Import failed');
        if (firefly.secret !== 'test-secret-123') throw new Error('Secret not imported');
        if (firefly.user.username !== 'testuser') throw new Error('User not imported');
        if (firefly._classes.length !== 2) throw new Error('Classes not imported');
    });
    
    // Test 11: Invalid JSON import should throw
    test('Invalid JSON import throws', () => {
        const firefly = new Firefly('https://test.fireflycloud.net');
        try {
            firefly.import('invalid json');
            throw new Error('Should have thrown');
        } catch (error) {
            if (error.message === 'Should have thrown') throw error;
            // Expected error
        }
    });
    
    // Test 12: School lookup (real API call)
    await asyncTest('School lookup with valid code', async () => {
        const result = await Firefly.getHost('billanook');
        if (!result) throw new Error('No school found');
        if (!result.host) throw new Error('Host not returned');
        if (!result.url) throw new Error('URL not returned');
    });
    
    // Test 13: Invalid school code
    await asyncTest('School lookup with invalid code', async () => {
        try {
            const result = await Firefly.getHost('nonexistent-school-code-12345');
            if (result !== null) throw new Error('Should return null for invalid code');
        } catch (error) {
            // API returns 404 for invalid codes, which is acceptable behavior
            if (error.response && error.response.status === 404) {
                // Expected - API throws 404 for invalid school codes
                return;
            }
            throw error;
        }
    });
    
    // Test 14: Classes getter requires authentication
    test('Classes getter requires authentication', () => {
        const firefly = new Firefly('https://test.fireflycloud.net');
        try {
            firefly.classes;
            throw new Error('Should have thrown');
        } catch (error) {
            if (error === 'Not authenticated') {
                // Expected
            } else if (error.message === 'Should have thrown') {
                throw error;
            }
        }
    });
    
    // Test 15: getTasks requires authentication
    test('getTasks requires authentication', () => {
        const firefly = new Firefly('https://test.fireflycloud.net');
        try {
            firefly.getTasks();
            throw new Error('Should have thrown');
        } catch (error) {
            if (error === 'Not authenticated') {
                // Expected
            } else if (error.message === 'Should have thrown') {
                throw error;
            }
        }
    });
    
    // Test 16: getTasks requires device ID
    test('getTasks requires device ID', () => {
        const firefly = new Firefly('https://test.fireflycloud.net');
        firefly.secret = 'test-secret';
        try {
            firefly.getTasks();
            throw new Error('Should have thrown');
        } catch (error) {
            if (error === 'No device ID') {
                // Expected
            } else if (error.message === 'Should have thrown') {
                throw error;
            }
        }
    });
    
    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(console.error);