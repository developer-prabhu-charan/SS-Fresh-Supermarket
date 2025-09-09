(async()=>{
  try{
    const res = await fetch('http://localhost:5000/api/products', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name:'TEST PROD', price:123, stock:10, available:true, featured:false }) });
    const body = await res.json();
    console.log('created:', body);
  }catch(e){ console.error(e) }
})();
