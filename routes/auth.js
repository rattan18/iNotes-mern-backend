const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = process.env.JWT_SECRET;

//CREATE A NEW USER USING "/api/auth/createuser". NO LOGIN REQUIRED
router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password should contain atleast 5 charcters').isLength({ min: 5 }),

], async (req, res) => {
  //IF THERE ARE ERRORS ,RETURN BAD REQUEST AND ERRORS
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(404).json({ success, error: "Sorry a user with this email already exists" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);
    user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email
      });
      const data ={
        user:{
          id: user.id
        }
      }

      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({success, authToken});
    // res.send(user);
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Some error occured");
  }
});


router.post('/login',[
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists()
  ], async (req,res)=>{
    let success = false;    
  //IF THERE ARE ERRORS ,RETURN BAD REQUEST AND ERRORS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  let {email,password} = req.body;
  try{

    let user = await User.findOne({email});
    if(!user){
        success = false;
        return res.status(400).json({success, error: 'Please try to log in with correct credentials'});
    }


    const passwordCmp = await bcrypt.compare(password, user.password);
    if(!passwordCmp){
          success = false;
          return res.status(400).json({success, error: 'Please try to log in with correct credentials'});
    }

    const data ={
      user:{
        id: user.id
      }
    }

    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({success, authToken});


  }catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post('/getuser', fetchuser, async(req, res)=>{
    try {
      const userId = req.user.id;
      let user = await User.findById(userId).select("-password");
      res.send(user);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
});

module.exports = router;