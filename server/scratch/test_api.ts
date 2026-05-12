async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/player/events?sport=&search=');
    const data = await res.json();
    console.log('--- API Response (with empty params) ---');
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Fetch error:', e);
  }
}
test();
