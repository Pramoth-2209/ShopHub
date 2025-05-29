function updatedatetime(){
    const now=new Date();
    document.getElementById('datetime').textContent=now.toLocaleString();
}
setInterval(updatedatetime,1000);
updatedatetime();


