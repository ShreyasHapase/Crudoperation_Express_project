//imports
const path=require('path')
require('dotenv').config();
const express=require("express")
const mongoose=require("mongoose")
const User=require("./models/user")
const multer=require("multer")
const fs=require("fs")
const session=require("express-session");
const app=express()
app.set('view engine','ejs')
app.set('views','views')
const PORT=process.env.PORT||4000
app.use(express.static(path.join(__dirname,"./",'public')))
//middlwware
app.use(express.urlencoded({extended:false}))
app.use(express.json());

app.use(session({
  secret:"my secret key",
  saveUninitialized:true,
  resave:false
}))

app.use((req,res,next)=>{
res.locals.message=req.session.message
delete req.session.message;
next()
})
//middlewers
//home page
//fetch data
app.get("/",(req,res)=>{
   User.find().then((users)=>{
    res.render("./partials/Index",{
      title:"home page",
      users:users
    })
   }).catch((err)=>{
   console.log("comthing went wrong")
   })
   })
//about page
app.get("/aboutpage",(req,res)=>{
res.render("./partials/about")
})
//addpage 
app.get("/adduser",(req,res)=>{
  res.render("./partials/adduser")
})

//database connection
  mongoose.connect(process.env.DB_URL,{useNewUrlParser:true})
  const db=mongoose.connection
  db.on('error',(error)=>console.log(error))
  db.once('open',()=>console.log("connected successfully"))


  //image upload
var storage=multer.diskStorage({
  destination:function(req,file,cb){
  cb(null,'./uploads')
  },
  filename:function(req,file,cb){
    cb(null,file.fieldname+"_"+Date.now()+"_"+file.originalname)
  },
  })
  var upload=multer({
    storage:storage,
  }).single("image")

  //image show
  app.use(express.static("uploads"))
  //record insert
  app.post('/adduser',upload,(req,res)=>{
   const user=new User({
    name:req.body.name,
    email:req.body.email,
    phone:req.body.phone,
    image:req.file.filename
   });
    user.save().then(()=>{console.log("data save successfully")}).catch((err)=>{
     console.log("document not save successfully")
    })
   res.redirect('/')
  })
  //update form
  app.get("/edit/:id",(req,res)=>{
    let id=req.params.id;
    User.findById(id).then((user)=>{
      res.render('./partials/edituser',{
        title:"edit users",
        user:user
      })
     }).catch((err)=>{
      res.redirect('/')
     })
  })
  //update data
  app.post('/update/:id',upload,(req,res)=>{
    let id=req.params.id;
     User.findByIdAndUpdate(id,{
      name:req.body.name,
      email:req.body.email,
      phone:req.body.phone,
     }).then(()=>{
      res.redirect("/")
     })
    })

  //delete data
  app.get('/delete/:id',(req,res)=>{
     let id=req.params.id;
     User.findByIdAndDelete(id).then(()=>{
      res.redirect("/")
     }).catch((err)=>{
     console.log("somthing went wrong")
     })  
  })
  
app.listen(PORT,()=>{
  console.log(`server started at http://localhost:${PORT}`)
})
