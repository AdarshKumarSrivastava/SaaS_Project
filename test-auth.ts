async function testAuth() {
  console.log('Testing Signup...');
  let res = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_audit_new2@buildspace.com', password: 'password123', name: 'Test Audit' })
  });
  let data = await res.json();
  console.log('Signup Response:', res.status, data);

  console.log('\nTesting Login...');
  res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_audit_new2@buildspace.com', password: 'password123' })
  });
  data = await res.json();
  console.log('Login Response:', res.status, data);
}
testAuth();
