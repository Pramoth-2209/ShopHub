function updatedatetime(){
    const now=new Date();
    document.getElementById('datetime').textContent=now.toLocaleString();
}
setInterval(updatedatetime,1000);
updatedatetime();

function togglemenu(){
    const menus=document.getElementById("menus");
    menus.classList.toggle('active')
}
