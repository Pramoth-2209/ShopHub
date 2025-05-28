const express=require('express')
const bodyparser=require('body-parser')
const expresslayout=require('express-ejs-layouts')
const app=express();

app.use(bodyparser.urlencoded({extended:false}))
app.set("view engine","ejs")
app.use(express.static('public'))

app.get("/",(req,res)=>{
    res.render("index")
})
app.get("/dashboard",(req,res)=>{
    res.render("dashboard")
})

app.listen(3000)