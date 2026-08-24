async function testAuthFull() {
  console.log('Testing Signup...');
  let res = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_audit_new3@buildspace.com', password: 'password123', name: 'Test Audit 3' })
  });
  let data = await res.json();
  console.log('Signup Response:', res.status, data);

  const otp = data.development_otp;
  if (!otp) {
    console.error('No OTP received, stopping test.');
    return;
  }

  console.log('\nTesting Verify OTP...');
  res = await fetch('http://localhost:3000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_audit_new3@buildspace.com', otp })
  });
  data = await res.json();
  console.log('Verify Response:', res.status, data);

  console.log('\nTesting Login...');
  res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_audit_new3@buildspace.com', password: 'password123' })
  });
  data = await res.json();
  console.log('Login Response:', res.status, Object.keys(data));
}
testAuthFull();
