const express=require('express')
const bodyparser=require('body-parser')
const expresslayout=require('express-ejs-layouts')
const app=express();

app.use(bodyparser.urlencoded({extended:false}))
app.set("view engine","ejs")

app.get("/",(req,res)=>{
    res.render("index")
})


app.listen(3000)