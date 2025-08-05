require('dotenv').config({ path: '.env.local' });

async function testCallbackSimple() {
  console.log('🧪 Testing Callback Routes (Simple)');
  console.log('=====================================');

  const baseUrl = 'https://setgelsudlal-git-main-saagiisgs-projects.vercel.app';

  try {
    // Test 1: Test general callback with minimal data
    console.log('\n📋 Test 1: Testing General Callback...');
    
    const generalCallbackData = {
      payment_id: 'TEST_PAY_123',
      payment_status: 'PAID',
      object_id: 'TEST_INV_123'
    };

    console.log('Sending general callback data:', generalCallbackData);

    const generalResponse = await fetch(`${baseUrl}/api/qpay-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generalCallbackData)
    });

    console.log('General callback response status:', generalResponse.status);
    
    if (generalResponse.ok) {
      const generalResult = await generalResponse.json();
      console.log('✅ General callback successful:', generalResult);
    } else {
      const errorText = await generalResponse.text();
      console.log('❌ General callback failed:', errorText);
    }

    // Test 2: Test course callback with minimal data
    console.log('\n📋 Test 2: Testing Course Callback...');
    
    const courseCallbackData = {
      payment_id: 'TEST_COURSE_PAY_123',
      payment_status: 'PAID',
      object_id: 'TEST_COURSE_INV_123'
    };

    console.log('Sending course callback data:', courseCallbackData);

    const courseResponse = await fetch(`${baseUrl}/api/qpay-course-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseCallbackData)
    });

    console.log('Course callback response status:', courseResponse.status);
    
    if (courseResponse.ok) {
      const courseResult = await courseResponse.json();
      console.log('✅ Course callback successful:', courseResult);
    } else {
      const errorText = await courseResponse.text();
      console.log('❌ Course callback failed:', errorText);
    }

    console.log('\n🎉 Callback test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCallbackSimple(); 