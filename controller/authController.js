const express =require('express');
const router=express.Router();
const bodyParser =require('body-parser');

const jwt = require ("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config  =require("../config");
const User =require("../modal/userSchema");
router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());
// router.use(express.urlencoded({ extended: false }))
// router.set('view engine', 'ejs')
//To get all the user
router.get('/users',(req,res)=>{
    User.find({},(err,data)=>{
        if(err) throw err;
        res.send(data)
    })
})

//Register
router.post('/register',(req,res)=>{
    let hashPassword=bcrypt.hashSync(req.body.password,8);
    User.create({
        name:req.body.name,
        email:req.body.email,
        password:hashPassword,
        phone:req.body.phone,
        role:req.body.role?req.body.role:"User",
        
    },(err,data)=>{
        if(err)  throw err;
        res.status(200).send("Registration SuccessFull")
    } )

})

//Login
router.post('/login',(req,res)=>{
    User.findOne({email:req.body.email},(err,user)=>{
        if(err){
            return res.status(500).send({auth:false,token:"Error while Login"})
        }
        if(!user){
            return res.status(200).send({auth:false,token:"No user Found Register First"})
        }else{
            const passIsValid=bcrypt.compareSync(req.body.password,user.password)
            if(!passIsValid){
                return res.status(200).send({auth:false,token:"Wrong Password"})
            }else{
                let token=jwt.sign({id:user._id},config.secret,{expiresIn:86400})
                res.status(200).send({auth:true,token:token})
            }

        }
    })
})

//userInfo
router.get("/userInfo",(req,res)=>{
    let token=req.headers['x-access-token'];
    if(!token){
        res.send({auth:false,token:"No token Provided"})
    }
    jwt.verify(token,config.secret,(err,user)=>{
        if(err) return res.status(200).send({auth:false,token:"Invalid Token"})
        User.findById(user.id,(err,result)=>{
            if(err) throw err;
            res.send(result)
        })
    })
})

//deleteUser
router.delete("/delete",(req,res)=>{
    User.remove({},(err,data)=>{
        if(err) throw err;
        res.send("User Deleted")
    })
})

// forget Password
// router.get('/forgetpassword',(req,res)=>{
//     try {
//         if({auth:false}){
//            res.render('forget')
//         }
//     } catch (error) {
//         console.log(error.message)
//     }
   
   
// })
// router.post('/forget',async (req,res)=>{
//     try {
//         const email=req.body.email;
//         const user= await User.findOne({email:email});
//         if(userData){
            
//         }
//         else{
//             res.render('forget',{message:"User mail is incorrect"})
//         }
//     } catch (error) {
//         console.log(error.message)
//     }
// })
// forget Password ends

module.exports=router;