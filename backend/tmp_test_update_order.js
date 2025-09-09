(async ()=>{
  try{
    const fetch = (await import('node-fetch')).default;
    const ordersRes = await fetch('http://localhost:5000/api/orders');
    const orders = await ordersRes.json();
    console.log('GET orders status', ordersRes.status);
    if(!orders || orders.length===0){ console.log('No orders to test'); return; }
    const id = orders[0]._id || orders[0].id;
    console.log('Testing order id', id, 'current status=', orders[0].status);
    const put = await fetch(`http://localhost:5000/api/orders/${id}`,{method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'Packed', address: orders[0].address })});
    console.log('PUT status', put.status);
    const updated = await put.json().catch(()=>null);
    console.log('PUT response', updated);
    const refetch = await fetch(`http://localhost:5000/api/orders`);
    const refreshed = await refetch.json();
    console.log('Refetched first order status=', (refreshed[0]||{}).status);
  }catch(e){ console.error('ERR', e.message); }
})();
