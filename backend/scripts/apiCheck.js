(async function(){
  try{
    const base = 'http://localhost:5000';
    const body = { email: 'seed@example.com', password: 'password' };
    const loginRes = await (await fetch(base + '/api/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body) })).json();
    console.log('login:', loginRes);
    const token = loginRes.token;
    const userId = (loginRes.user && (loginRes.user.id || loginRes.user._id)) || null;
    if(!token || !userId){
      console.error('No token or userId returned from login');
      process.exit(1);
    }
    const ordersRes = await (await fetch(`${base}/api/customers/${userId}/orders`, { method: 'GET', headers: { Authorization: `Bearer ${token}` } })).json();
    console.log('orders:', ordersRes);
  }catch(e){
    console.error('apiCheck error:', e);
    process.exit(1);
  }
})();
