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
  password: 'TooJoo_1967',
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
    const a="open"
    db.query('select(select count(*) from customers) as total,(select count(*) from producttable where product_status="closed")as cls,(select count(*) from producttable where product_status="auctioned")as auc,(select count(*) from producttable where product_status=?)as ap,(select sum(loan_amount)from producttable where product_status="open" )as la',[a],(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message})
        }

         res.render("dashboard",{total:results[0]})
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
        res.redirect("/customerdetails/"+ecid)
    })

})



app.get("/totalpawn",(req,res)=>{
  
    db.query(`select *,(select count(*) from producttable where product_status='open')as ap,(select count(*) from producttable where product_type='gold' and product_status='open')as gold,(select count(*) from producttable where product_type='silver' and product_status='open')as silver,(select count(*) from producttable where product_type='diamond' and product_status='open')as diamond from producttable where product_status='open'`,(err,results)=>{
        if(err){
            res.send('error')
        } 
        res.render('totalpawn',{opens:results,op:results[0]})
    })
    
})


app.get('/tclosedpawn',(req,res)=>{
    db.query(`select *,(select count(*) from producttable where product_status='closed') as ap,(select count(*) from producttable where product_type='gold' and product_status='closed')as gold,(select count(*)from producttable where product_type='silver' and product_status='closed')as silver,(select count(*) from producttable where product_type='diamond' and product_status='closed')as diamond from producttable where product_status='closed'`,(err,results)=>{
        if(err){
            res.send('error')
        }
        res.render('tclosedpawn',{closed:results,cls:results[0]})
    })
})


app.get('/tauctionedpawn',(req,res)=>{
    db.query(`select *,(select count(*) from producttable where product_status='auctioned') as ap,(select count(*) from producttable where product_type='gold' and product_status='auctioned')as gold,(select count(*)from producttable where product_type='silver' and product_status='auctioned')as silver,(select count(*) from producttable where product_type='diamond' and product_status='auctioned')as diamond from producttable where product_status='auctioned'`,(err,results)=>{
        if(err){
            res.send('error')
        }
        res.render('tauctionedpawn',{closed:results,cls:results[0]})
    })
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
    db.query('select * from customers left join  producttable on customers.id = producttable.cid where customers.id=?',[cids],(err,results)=>{
        if(err) throw err;
        db.query(`select *,(select count(*) from producttable where product_status="open")as copen,
            (select count(*)from producttable where product_status="closed")as closed,
            (select count(*)from producttable where product_status="auctioned")as acution,
            (select count(*) from producttable where product_type="silver" and product_status="open")as csilver, 
            (select count(*) from producttable where product_type="diamond" and product_status="open")as cdiamond, 
            (select count(*) from producttable where product_type="gold" and product_status="open")as cgold, 
            (select count(*) from producttable where product_type="silver" and product_status="closed")as clsilver, 
            (select count(*) from producttable where product_type="diamond" and product_status="closed")as cldiamond, 
            (select count(*) from producttable where product_type="gold" and product_status="closed")as clgold,
            (select count(*) from producttable where product_type="silver" and product_status="auctioned")as asilver, 
            (select count(*) from producttable where product_type="diamond" and product_status="auctioned")as adiamond, 
            (select count(*) from producttable where product_type="gold" and product_status="auctioned")as agold 
            from producttable where cid=? `,[cids],(err2,results2)=>{
            if(err2) throw err2;

            res.render('customerdetails',{products:results[0],lpro:results,cdetails:results2[0]})
        })
            
    })
})



app.get('/history',(req,res)=>{
    res.render("history")
})



app.get('/acounts',(req,res)=>{
    const days=new Date();
    const months=days.getMonth();
    const ccc=months+1;
    db.query("select producttable.*,duetable.*,(select sum(loan_amount)from producttable where month(product_opened_date)=?)as gg,(select sum(due_amount_paid)from duetable where month(payment_date)=?)as ggg from producttable left join duetable on producttable.product_id=duetable.pro_id WHERE MONTH(producttable.product_opened_date) = ? OR MONTH(duetable.payment_date) = ?",[ccc,ccc,ccc,ccc],(err,results)=>{
        if(err) throw err;
        if(results.length===0){
            return res.render("acounts")
        }
        res.render("acounts",{bb:results[0],df:results,message:null})
      
    })
})

app.post("/filter",(req,res)=>{
    const{filterdate,filtermonth,filteryear}=req.body;
    if(filterdate){
    db.query(`select producttable.*,duetable.*,(select sum(loan_amount) from producttable where day(product_opened_date)=?)as dd,(select sum(due_amount_paid)from duetable where day(payment_date)=?)as ddd from producttable left join duetable on producttable.product_id=duetable.pro_id WHERE day(producttable.product_opened_date) = ? OR day(duetable.payment_date) = ?`,[filterdate,filterdate,filterdate,filterdate],(err,results)=>{
        if(err) throw err;
        if(!results || results.length===0){
            return res.render("acounts",{bb:null,df:[],message:"no record :("})
        }
        res.render("acounts",{bb:results[0],df:results,message:null})
        return ;
    })
    }
    else if(filtermonth){
    db.query(`select producttable.*,duetable.*,(select sum(loan_amount) from producttable where month(product_opened_date)=?)as mm,(select sum(due_amount_paid)from duetable where month(payment_date)=?)as mmm from producttable left join duetable on producttable.product_id=duetable.pro_id WHERE MONTH(producttable.product_opened_date) = ? OR MONTH(duetable.payment_date) = ?`,[filtermonth,filtermonth,filtermonth,filtermonth],(err,results)=>{
        if(err) throw err;
        res.render("acounts",{bb:results[0],df:results,message:null})
        return ;
    })
    }
    else if(filteryear){
    db.query(`select producttable.*,duetable.*,(select sum(loan_amount) from producttable where year(product_opened_date)=?)as yy,(select sum(due_amount_paid)from duetable where year(payment_date)=?)as yyy from producttable left join duetable on producttable.product_id=duetable.pro_id WHERE year(producttable.product_opened_date) = ? OR year(duetable.payment_date) = ?`,[filteryear,filteryear,filteryear,filteryear],(err,results)=>{
        if(err) throw err;
        res.render("acounts",{bb:results[0],df:results,message:null})
        return;
    })
    }
    else if(filterdate&&filtermonth&&filteryear){
        db.query(`select producttable.*,duetable.*,(select sum(loan_amount) from producttable where day(product_opened_date)='filterdate',where month(product_opened_date)='filtermonth', year(product_opened_date)=?)as ff,(select sum(due_amount_paid) from duettable where day(product_opened_date)='filterdate',where month(product_opened_date)='filtermonth', year(product_opened_date)=?)as fff from producttable left join duetable on producttable.product_id=duetable.pro_id WHERE MONTH(producttable.product_opened_date) = ? OR MONTH(duetable.payment_date) = ?`,[filteryear,filteryear,filteryear],(err,results)=>{
        if(err) throw err;
        res.render("acounts",{bb:results[0],df:results,message:null})
        return ;
    })
    }
})



app.get("/addrecord/:id",(req,res)=>{
    const cids=req.params.id
    res.render("addrecord",{customerid:cids})
})



app.get('/productdetails/:id',(req,res)=>{
    const cids=req.params.id;
    db.query(`select*from producttable left join duetable on producttable.product_id = duetable.pro_id left join closepawn on producttable.product_id = closepawn.prod_id where product_id=?`,[cids],(err,results)=>{
        if(err){
            res.send("error")
        }
        res.render('productdetails',{pds:results[0],due:results})
    })

})


app.get("/addintrest/:id",(req,res)=>{
    const cids=req.params.id;
    res.render("addintrest",{ids:cids})
})



app.get("/closepawn/:id",(req,res)=>{
    const cids=req.params.id;
    db.query("select * from producttable where product_id=?",[cids],(err,results)=>{
        if(err){
            res.send("error")
        }
        res.render("closepawn",{ids:results[0]})
    })
    
})



app.post('/clspawn',(req,res)=>{
    const{cpproductId,cploanamount,cpamountpaid,cpname,cpstatus}=req.body;
    db.query("insert into closepawn(prod_id,amount_paid,cname,loanamount,productstatus)values(?,?,?,?,?)",[cpproductId,cpamountpaid,cpname,cploanamount,cpstatus],(err)=>{
        if(err){
            console.error("Insert error:", err); // Log the error for debugging
        return res.send("error inserting");  // 🛑 STOP here with return
        }
        db.query("update producttable set product_status=? where product_id=?",[cpstatus,cpproductId],(err2,results2)=>{
            if(err2){
               console.error("Update error:", err2); // Log the error
            return res.send("error updating");    
            }
        })
        res.redirect("productdetails/"+cpproductId);
    })
})



app.post("/intrest",(req,res)=>{
    const{productId,amountpaid,paymentmethod,ipname}=req.body;
    console.log(productId,amountpaid,paymentmethod,ipname)
    db.query("insert into duetable(pro_id,due_amount_paid,mode,name)values(?,?,?,?)",[productId,amountpaid,paymentmethod,ipname],(err)=>{
        if(err){
            res.send("error")
        }
        res.redirect("productdetails/"+productId);
    })
})

app.post('/addrecorddetails',upload.single('productPhoto'),(req,res)=>{
    const{customerId,productName,productType,productWeight,estimatedAmount,loanAmount,intrestRate,dueDate}=req.body;
    const productPhoto='/uploads/'+req.file.filename;
    db.query('insert into producttable(cid,product_name,product_type,product_weight,estimated_amount,loan_amount,interest_rate,due_date,product_image)values(?,?,?,?,?,?,?,?,?)',[customerId,productName,productType,productWeight,estimatedAmount,loanAmount,intrestRate,dueDate,productPhoto],(err)=>{
    if(err)throw err;
    res.redirect('customerdetails/'+customerId);
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
function formatNumbers(num){
    if(num>=10000000){
        return"₹."+(num/10000000).toFixed(0).replace(/\.00$/, '')+'cr';
    }else if(num>=100000){
        return"₹." +(num/100000).toFixed(0).replace(/\.00$/,'')+'L';
    }else if(num>=1000){
        return"₹." +(num/1000).toFixed(0).replace(/\.00$/,'')+'k';
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
app.locals.formatNumbers=formatNumbers;


app.listen(3000,()=>{
    console.log("app started in 3000")
});