

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

function register(){
    const name=document.getElementById('name').value;
    const fathername=document.getElementById('fathername').value;
    const dob=document.getElementById('dob').value;
    const phonenumber=document.getElementById('phonenumber').value;
    const occupation=document.getElementById('occupation').value;
    const address=document.getElementById('address').value;
    console.log(name,fathername,dob,phonenumber,occupation,address);
    if(!name||!fathername||!dob||!phonenumber||!occupation||!address){
        alert("all fields need to be filled")
    }
   

    fetch("http://localhost:3000/addcustomer",{
        method:"post",
        headers:{
            "content-Type":'application/json'
        },
        body:JSON.stringify({name,fathername,dob,phonenumber,occupation,address})
    })
    .then(response=>response.json())
    .then(data=>{alert(data.message);})
    .then(data=>{alert(data.error);})
    .catch(error=>console.error("Error:",error))   

}