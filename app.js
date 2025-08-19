const express=require('express')
const bodyparser=require('body-parser')
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs');
const session=require('express-session');
const expresslayout=require('express-ejs-layouts');
const { error } = require('console');
const app=express();

app.use(bodyparser.urlencoded({extended:true}))
app.set("view engine","ejs")
app.use(express.json())
app.use(express.static('public'))
app.use(session({
    secret:"mysecretkey",
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false}
}))
app.use((req,res,next)=>{
    res.set('cache-Control','no-store,no-cache,must-revalidate,private')
    next();
})

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
    res.render("index",{message:null})
})



app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/login",(req,res)=>{
    const{aname,apassword}=req.body
    db.query(`select*from admins where Name=? and password=?`,[aname,apassword],(err,results)=>{
        if(results.length>0){
            req.session.name=results[0];
            res.redirect('/dashboard')
        }
        else{
            res.render("index",{message:'"invalid username and password"'})
        }
    })
})


app.get("/adminregi",(req,res)=>{
    res.render("adminregi")
})


app.post("/areg",(req,res)=>{
    const{Name,password}=req.body;
    db.query("insert into admins (Name,password) values(?,?)",[Name,password],(err)=>{
        if(err)throw err;
        res.redirect("/")
    })
})



app.get("/dashboard",(req,res)=>{
    if(req.session.name){
    const a="open"
    const days = new Date();
    const months = days.getDate();
    const ccc = months;
    db.query('select(select count(*) from customers) as total,(select count(*) from producttable where product_status="closed")as cls,(select count(*) from producttable where product_status="auctioned")as auc,(select count(*) from producttable where product_status=?)as ap,(select sum(loan_amount)from producttable where product_status="open" )as la',[a],(err,results)=>{
        if(err)return res.status(500).json({error:err.message})
        db.query('select * from producttable where day(product_opened_date)=?',[ccc],(err2,results2)=>{
            if(err2) return res.status(500).json({error:err.message})

            res.render("dashboard",{total:results[0],to:results2,name:req.session.name})
        })
    })}
    else{
        res.render('login')
    }
})



app.get("/addcustomer",(req,res)=>{  
    if(req.session.name){
        res.render('addcustomer',{name:req.session.name})
        }
        else{
            res.render('login')
        }
})


 
app.get("/editcustomerdetails/:id",(req,res)=>{
    if(req.session.name){
    const cid=req.params.id;
    db.query("select * from customers where customers.id=?",[cid],(err,results)=>{
        if(err){
            res.send("error")
        }
        res.render('editcustomerdetails',{customersdetail:results,name:req.session.name})
    })
    }
    else{
        res.render('login')
    }
    
})



app.post("/add", upload.single('photo'),(req,res)=>{
    if(req.session.name){
    const {name,father_name,date_of_birth,phone_number,occupation,address}=req.body;
    const photo_path='/uploads/'+req.file.filename;
    db.query('INSERT INTO customers (name,father_name,date_of_birth,phone_number,occupation,photo_path,address) VALUES (?,?,?,?,?,?,?)', [name,father_name,date_of_birth,phone_number,occupation,photo_path,address], (err) => {
    if (err) throw err;
    res.redirect('totalcustomer');
    })
    }
    else{
        res.render("login")
    }
})



app.post("/edit/:id",upload.single('photo'),(req,res)=>{
    if(req.session.name){
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
    }
    else{
        res.render('login')
    }

})



app.get("/totalpawn",(req,res)=>{
  
    if(req.session.name){
    db.query(`select *,(select count(*) from producttable where product_status='open')as ap,(select count(*) from producttable where product_type='gold' and product_status='open')as gold,(select count(*) from producttable where product_type='silver' and product_status='open')as silver,(select count(*) from producttable where product_type='diamond' and product_status='open')as diamond from producttable where product_status='open'`,(err,results)=>{
        if(err){
            res.send('error')
        } 
        res.render('totalpawn',{opens:results,op:results[0],name:req.session.name})
    })}
    else{
        res.render("login")
    }
    
})



app.get('/tclosedpawn',(req,res)=>{
    if(req.session.name){
    db.query(`select *,(select count(*) from producttable where product_status='closed') as ap,(select count(*) from producttable where product_type='gold' and product_status='closed')as gold,(select count(*)from producttable where product_type='silver' and product_status='closed')as silver,(select count(*) from producttable where product_type='diamond' and product_status='closed')as diamond from producttable where product_status='closed'`,(err,results)=>{
        if(err){
            res.send('error')
        }
        res.render('tclosedpawn',{closed:results,cls:results[0],name:req.session.name})
    })
    }
    else{
        res.render('login')
    }
})



app.get('/tauctionedpawn',(req,res)=>{
    if(req.session.name){
    db.query(`select *,(select count(*) from producttable where product_status='auctioned') as ap,(select count(*) from producttable where product_type='gold' and product_status='auctioned')as gold,(select count(*)from producttable where product_type='silver' and product_status='auctioned')as silver,(select count(*) from producttable where product_type='diamond' and product_status='auctioned')as diamond from producttable where product_status='auctioned'`,(err,results)=>{
        if(err){
            res.send('error')
        }
        res.render('tauctionedpawn',{closed:results,cls:results[0],name:req.session.name})
    })
    }
    else{
        res.render("login")
    }
})



app.get("/totalcustomer",(req,res)=>{
    if(req.session.name){
     db.query('select*from customers',(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message})
        }
        res.render("totalcustomer",{cu:results,name:req.session.name})
    })
    }
    else{
        res.render('login')
    }
})



app.get("/customerdetails/:id",(req,res)=>{
    if(req.session.name){
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
            if(!results2||results2.length===0){
                return res.render("customerdetails",{products:results[0],lpro:[],cdetails:null,cdet:"no data",name:req.session.name})
            }
            res.render('customerdetails',{products:results[0],lpro:results,cdetails:results2[0],cdet:null,name:req.session.name})
        })
            
    })
    }
    else{
        req.render('login')
    }
})



app.get('/history',(req,res)=>{
    if(req.session.name){
    db.query(`select * from customers`,(err,results)=>{
        if(err) throw err;
        db.query(`select * from closepawn`,(err2,results2)=>{
            if(err) throw err2;
            db.query(`select * from duetable`,(err3,results3)=>{
                if(err) throw err3;
                db.query(`select * from producttable`,(err4,results4)=>{
                    if(err4) throw err4
                    
                     res.render("history",{details:results,cpdetails:results2,dtdetails:results3,ptdetails:results4,name:req.session.name})
                })
            })
        })
       
    })
    }
    else{
        res.render("login")
    } 
})



app.get('/acounts',(req,res)=>{
if(req.session.name){

const days = new Date();
const months = days.getMonth();
const ccc = months + 1;

    db.query(`select * from producttable where month(product_opened_date)=?`,[ccc],(err,results)=>{
        if(err) throw err;
        db.query(`select *from duetable where month(payment_date)=? `,[ccc],(err2,results2)=>{
            if(err2) throw err2;
            db.query(`select sum(due_amount_paid)as ggg from duetable where month(payment_date)=?`,[ccc],(err3,results3)=>{
                if(err3) throw err3;
                db.query(`select sum(loan_amount)as ggg from producttable where month(product_opened_date)=?`,[ccc],(err4,results4)=>{
                    if(err4)throw err4;
                    res.render("acounts",{bb:results4[0],bbb:results3[0],df:results2,dfs:results,name:req.session.name,message:null});
                })
                 
            })
           
        })
        
    })
}
else{
    res.render("login")
 }  
})



app.post("/filter",(req,res)=>{
    if(req.session.name){
    const{filterdate,filtermonth,filteryear}=req.body;
if(filterdate){
    db.query(`select * from producttable where day(product_opened_date)=?`,[filterdate],(err,results)=>{
        if(err) throw err;
        db.query(`select *from duetable where day(payment_date)=? `,[filterdate],(err2,results2)=>{
            if(err2) throw err2;
            db.query(`select sum(due_amount_paid)as ggg from duetable where day(payment_date)=?`,[filterdate],(err3,results3)=>{
                if(err3) throw err3;
                db.query(`select sum(loan_amount)as ggg from producttable where day(product_opened_date)=?`,[filterdate],(err4,results4)=>{
                    if(err4)throw err4;
                    res.render("acounts",{bb:results4[0],bbb:results3[0],df:results2,dfs:results,name:req.session.name,message:null});
                })
                 
            })
           
        })
        
    })
}



else if(filtermonth){
    db.query(`select * from producttable where month(product_opened_date)=?`,[filtermonth],(err,results)=>{
        if(err) throw err;
        db.query(`select *from duetable where month(payment_date)=? `,[filtermonth],(err2,results2)=>{
            if(err2) throw err2;
            db.query(`select sum(due_amount_paid)as ggg from duetable where month(payment_date)=?`,[filtermonth],(err3,results3)=>{
                if(err3) throw err3;
                db.query(`select sum(loan_amount)as ggg from producttable where month(product_opened_date)=?`,[filtermonth],(err4,results4)=>{
                    if(err4)throw err4;
                    res.render("acounts",{bb:results4[0],bbb:results3[0],df:results2,dfs:results,name:req.session.name,message:null});
                })
                 
            })
           
        })
        
    })
}



else if(filteryear){
    db.query(`select * from producttable where year(product_opened_date)=?`,[filteryear],(err,results)=>{
        if(err) throw err;
        db.query(`select *from duetable where year(payment_date)=? `,[filteryear],(err2,results2)=>{
            if(err2) throw err2;
            db.query(`select sum(due_amount_paid)as ggg from duetable where year(payment_date)=?`,[filteryear],(err3,results3)=>{
                if(err3) throw err3;
                db.query(`select sum(loan_amount)as ggg from producttable where year(product_opened_date)=?`,[filteryear],(err4,results4)=>{
                    if(err4)throw err4;
                    res.render("acounts",{bb:results4[0],bbb:results3[0],df:results2,dfs:results,name:req.session.name,message:null});
                })
                 
            })
           
        })
        
    })
}



else if(filteryear && filterdate && filtermonth){
    db.query(`select * from producttable where year(product_opened_date)=?, day(product_opened_date)=?, month(product_opened_date)=?`,[filteryear,filterdate,filtermonth],(err,results)=>{
        if(err) throw err;
        db.query(`select *from duetable where year(payment_date)=?, day(product_opened_date)=? ,month(product_opened_date)=? `,[filteryear,filterdate,filtermonth],(err2,results2)=>{
            if(err2) throw err2;
            db.query(`select sum(due_amount_paid)as ggg from duetable where year(payment_date)=?,day(product_opened_date)=?, month(product_opened_date)=?`,[filteryear,filterdate,filtermonth],(err3,results3)=>{
                if(err3) throw err3;
                db.query(`select sum(loan_amount)as ggg from producttable where year(product_opened_date)=?,day(product_opened_date)=?,month(product_opened_date)=?`,[filteryear,filterdate,filtermonth],(err4,results4)=>{
                    if(err4)throw err4;
                    res.render("acounts",{bb:results4[0],bbb:results3[0],df:results2,dfs:results,name:req.session.name,message:null});
                   
                })
                 
            })
           
        })
        
    })
}
}
 else{
     res.render("login");
}
})



app.get("/addrecord/:id",(req,res)=>{
    if(req.session.name){
    const cids=req.params.id
    res.render("addrecord",{customerid:cids,name:req.session.name})
    }
    else{
        res.render("login")
    }
})



app.get('/productdetails/:id',(req,res)=>{
    if(req.session.name){
    const cids=req.params.id;
    db.query(`select*from producttable left join duetable on producttable.product_id = duetable.pro_id left join closepawn on producttable.product_id = closepawn.prod_id where product_id=?`,[cids],(err,results)=>{
        if(err)throw err;
        res.render('productdetails',{pds:results[0],due:results,name:req.session.name})
    })
}
else{
    res.render("login")
}
})


app.get("/addintrest/:id",(req,res)=>{
    if(req.session.name){
    const cids=req.params.id;
    res.render("addintrest",{ids:cids,name:req.session.name})
    }
    else{
        res.render("login")
    }
})



app.get("/closepawn/:id",(req,res)=>{
    if(req.session.name){
    const cids=req.params.id;
    db.query("select * from producttable where product_id=?",[cids],(err,results)=>{
        if(err){
            res.send("error")
        }
        res.render("closepawn",{ids:results[0],name:req.session.name})
    })
    }else{
        res.render("login")
    }
    
})



app.post('/clspawn',(req,res)=>{
    if(req.session.name){
    const{cpproductId,cploanamount,cpamountpaid,cpname,cpstatus}=req.body;
    db.query("insert into closepawn(prod_id,amount_paid,cname,loanamount,productstatus)values(?,?,?,?,?)",[cpproductId,cpamountpaid,cpname,cploanamount,cpstatus],(err)=>{
        if(err){
            console.error("Insert error:", err); 
        return res.send("error inserting"); 
        }
        db.query("update producttable set product_status=? where product_id=?",[cpstatus,cpproductId],(err2,results2)=>{
            if(err2){
               console.error("Update error:", err2); 
            return res.send("error updating");    
            }
        })
        res.redirect("productdetails/"+cpproductId);
    })
    }
    else{
        res.render("login")
    }
})



app.post("/intrest",(req,res)=>{
    if(req.session.name){
    const{productId,amountpaid,paymentmethod,ipname}=req.body;
    console.log(productId,amountpaid,paymentmethod,ipname)
    db.query("insert into duetable(pro_id,due_amount_paid,mode,name)values(?,?,?,?)",[productId,amountpaid,paymentmethod,ipname],(err)=>{
        if(err){
            res.send("error")
        }
        res.redirect("productdetails/"+productId);
    })
    }
    else{
        res.render("login")
    }
})

app.post('/addrecorddetails',upload.single('productPhoto'),(req,res)=>{
    if(req.session.name){
    const{customerId,productName,productType,productWeight,estimatedAmount,loanAmount,intrestRate,dueDate}=req.body;
    const productPhoto='/uploads/'+req.file.filename;
    db.query('insert into producttable(cid,product_name,product_type,product_weight,estimated_amount,loan_amount,interest_rate,due_date,product_image)values(?,?,?,?,?,?,?,?,?)',[customerId,productName,productType,productWeight,estimatedAmount,loanAmount,intrestRate,dueDate,productPhoto],(err)=>{
    if(err)throw err;
    res.redirect('customerdetails/'+customerId);
    })
    }
    else{
        res.render("login")
    }
})



app.get('/search',(req,res)=>{
    if(req.session.name){
    const q=req.query.q;
    db.query('select * from customers where phone_number = ?',[q],(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message})
        }
         res.render('search',{sr:results,name:req.session.name})
    })
    }
    else{
        res.render('login')
    }
})



app.post('/addnew',(req,res)=>{
    if(req.session.name){
    const names=req.body;
    console.log(names);
    res.send('added successfully')
    }
    else{
        res.render('login')
    }
})



app.post('/addcustomer',(req,res)=>{
    if(req.session.name){
    const {name,fathername,dob,phonenumber,occupation,address}=req.body;
    if(!name||!fathername||!dob||!phonenumber||!occupation||!address){
        return res.status(500);
    }
    res.json({message:'user register succsfully'})
    }
    else{
        res.render("login")
    }
})


app.get('/logout',(req,res)=>{
    if(req.session.name){
    req.session.destroy();
    res.redirect('/')
    }
    else{
        res.render("login")
    }
})


app.get("/vp",(req,res)=>{
    res.render("vp")
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