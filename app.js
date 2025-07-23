const express=require('express')
const bodyparser=require('body-parser')
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs');
const expresslayout=require('express-ejs-layouts');
const { error } = require('console');
const app=express();

app.use(bodyparser.urlencoded({extended:true}))
app.set("view engine","ejs")
app.use(express.json())
app.use(express.static('public'))

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'testdb'
});
db.connect();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });


app.get("/",(req,res)=>{
    res.render("index")
})



app.get("/dashboard",(req,res)=>{
    db.query('select count(*) as total from customers',(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message})
        }
         res.render("dashboard",{total:results[0].total})
    })
})



app.get("/addcustomer",(req,res)=>{  
        res.render('addcustomer')
})

 
app.get("/editcustomerdetails/:id",(req,res)=>{
    const cid=req.params.id;
    db.query("select * from customers where customers.id=?",[cid],(err,results)=>{
        if(err){
            res.send("error")
        }
        res.render('editcustomerdetails',{customersdetail:results})
    })
    
})

app.post("/add", upload.single('photo'),(req,res)=>{
    const {name,father_name,date_of_birth,phone_number,occupation,address}=req.body;
    const photo_path='/uploads/'+req.file.filename;
    db.query('INSERT INTO customers (name,father_name,date_of_birth,phone_number,occupation,photo_path,address) VALUES (?,?,?,?,?,?,?)', [name,father_name,date_of_birth,phone_number,occupation,photo_path,address], (err) => {
    if (err) throw err;
    res.redirect('totalcustomer');
    })
})

app.post("/edit/:id",upload.single('photo'),(req,res)=>{
    const{name,father_name,date_of_birth,phone_number,occupation,address}=req.body;
    const ecid=req.params.id;
    let sql,data;
    if(req.file){
        const photo="/uploads/"+req.file.filename;
        sql="update customers Set name=?,father_name=?,date_of_birth=?,phone_number=?,occupation=?,photo_path=?,address=? where id=?";
        data=[name,father_name,date_of_birth,phone_number,occupation,photo,address,ecid]
    }else{
        sql="update customers Set name=?,father_name=?,date_of_birth=?,phone_number=?,occupation=?,address=? where id=?";
        data=[name,father_name,date_of_birth,phone_number,occupation,address,ecid]
    }
    db.query(sql,data,(err,results)=>{
        if(err)throw err;
        res.redirect("/")
    })

})


app.get("/totalpawn",(req,res)=>{
    res.render('totalpawn')
})



app.get("/totalcustomer",(req,res)=>{
     db.query('select*from customers',(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message})
        }
        res.render("totalcustomer",{cu:results})
    })
})



app.get("/customerdetails/:id",(req,res)=>{
    const cids=req.params.id
    db.query('select * from customers left join  producttable on customers.id =  producttable.cid where customers.id=?',[cids],(err,results)=>{
        if(err){
            res.send("error");
        }
            res.render('customerdetails',{products:results})
    })
})



app.get("/addrecord/:id",(req,res)=>{
    const cids=req.params.id
    res.render("addrecord",{customerid:cids})
})



app.post('/addrecorddetails',upload.single('productPhoto'),(req,res)=>{
    const{customerId,productName,productType,productWeight,estimatedAmount,loanAmount,intrestRate,dueDate,productstatus,productcloseddate}=req.body;
    const productPhoto='/uploads/'+req.file.filename;
    db.query('insert into producttable(cid,product_name,product_type,product_weight,estimated_amount,loan_amount,interest_rate,due_date,product_image,product_status,product_closed_date)values(?,?,?,?,?,?,?,?,?,?,?)',[customerId,productName,productType,productWeight,estimatedAmount,loanAmount,intrestRate,dueDate,productPhoto,productstatus,productcloseddate],(err)=>{
    if(err)throw err;
    res.redirect('/');
    })
})



app.get('/search',(req,res)=>{
    const q=req.query.q;
    db.query('select * from customers where phone_number = ?',[q],(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message})
        }
         res.render('search',{sr:results})
    })
})



app.post('/addnew',(req,res)=>{
    const names=req.body;
    console.log(names);
    res.send('added successfully')
})



app.post('/addcustomer',(req,res)=>{
    const {name,fathername,dob,phonenumber,occupation,address}=req.body;
    if(!name||!fathername||!dob||!phonenumber||!occupation||!address){
        return res.status(500);
    }
    res.json({message:'user register succsfully'})
})






function formatNumber(num){
    if(num>=10000000){
        return"₹."+(num/10000000).toFixed(2).replace(/\.00$/, '')+'cr';
    }else if(num>=100000){
        return"₹." +(num/100000).toFixed(2).replace(/\.00$/,'')+'L';
    }else if(num>=1000){
        return"₹." +(num/1000).toFixed(2).replace(/\.00$/,'')+'k';
    }else{
        return"₹."+num.toString();
    }
}



function formatd(num){
    num=Number(num)
    if(num>=10000000){
        return(num/10000000).toFixed(2).replace(/\.00$/, '')+'cr';
    }else if(num>=100000){
        return(num/100000).toFixed(2).replace(/\.00$/,'')+'L';
    }else if(num>=1000){
        return(num/1000).toFixed(2).replace(/\.00$/,'')+'k';
    }else{
        return num.toString();
    }
}
app.locals.formatd=formatd;
app.locals.formatNumber=formatNumber;


app.listen(3000,()=>{
    console.log("app started in 3000")
});