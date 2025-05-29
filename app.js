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

function formatNumber(num){
    if(num>=10000000){
        return"₹"+(num/10000000).toFixed(2).replace(/\.00$/, '')+'cr';
    }else if(num>=100000){
        return"₹" +(num/100000).toFixed(2).replace(/\.00$/,'')+'L';
    }else if(num>=1000){
        return"₹" +(num/1000).toFixed(2).replace(/\.00$/,'')+'k';
    }else{
        return"₹"+num.tostring();
    }
}

function formatd(num){
    if(num>=10000000){
        return(num/10000000).toFixed(2).replace(/\.00$/, '')+'cr';
    }else if(num>=100000){
        return(num/100000).toFixed(2).replace(/\.00$/,'')+'L';
    }else if(num>=1000){
        return(num/1000).toFixed(2).replace(/\.00$/,'')+'k';
    }else{
        returnnum.tostring();
    }
}
app.locals.formatd=formatd;
app.locals.formatNumber=formatNumber;

app.listen(3000)