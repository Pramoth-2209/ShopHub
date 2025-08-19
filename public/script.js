

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
    // if(!name||!fathername||!dob||!phonenumber||!occupation||!address){
    //     alert("all fields need to be filled")
    // }
    // else 
    if(name.length<=0||name.match(" ")){
        alert("Please enter value in Name field")
    }
    else if(fathername.length<=0||fathername.match(" ")){
        alert("Please enter value in Father Name field")
    }
    else if(dob.length<=0||dob.match(" ")){
        alert("Please enter value in Date Of Birth field")
    }
    else if(phonenumber.length<=0||phonenumber.match(" ")){
        alert("Please enter value in Phone No. field")
    }
    else if(occupation.length<=0||occupation.match(" ")){
        alert("please enter value in Occupation field")
    }
    else if(address.length<=0 ||address.match(" ")){
        alert("Please enter value in address field")
    }
    else{
        alert("Customer added successfully")
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

function cpvalidation(){
    let a=document.getElementById("cpproductId").value;
    let b=document.getElementById("cploanamount").value;
    let c=document.getElementById("cpamountpaid").value;
    let d=document.getElementById("cpstatus").value;
    let e=document.getElementById("cpname").value;
    // console.log(a)
    // console.log(b)
    // console.log(c)
    // console.log(d)
    // console.log(e)
    if(a.length<=0||a.match(" ")){
        alert("Enter value at product id field")
    }else if(b.length<=0||b.match(" ")){
        alert("Enter value at loan amount field")
    }else
    if(c.length<=0||c.match(" ")){
        alert("Enter value at amount paid field")
    }else
    if(d.length<=0||d.match(" ")){
        alert("Set the status")
    }else
    if(e.length<=0||e.match(" ")){
        alert("Enter value at name field")
    }
    else{
        alert("Pawn closed successfully 👍")
    }
}
function log(){
    let a=document.getElementById("userid").value;
    let b=document.getElementById("password").value;
    if(a.length<=0||a.match(" ")){
        alert("Enter value at username field")
    }else if(b.length<=0||b.match(" ")){
        alert("Enter value at password field")
    } else{
       
    }
}

function sub(){
    let a=document.getElementById("filterdate").value;
    let b=document.getElementById("filtermonth").value;
    let c=document.getElementById("filteryear").value;
    if(a.length<=0||a.match(" ")&&b.length<=0||b.match(" ")&&c.length<=0||c.match(" ")){
        alert("Due to empty fields filter cannot be applied")
    }
    
}