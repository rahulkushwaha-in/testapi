const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');;
const User = require('../models/user');
const {v4: uuidv4} = require('uuid');

//importing validator
const { check, validationResult } = require('express-validator');

//registering a new user
router.post('/register',[
    check('name', 'Name is Required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
], 
async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const {name, email, password} = req.body;
    try {
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                msg: "User Already Exists"
            });
        }
        user = new User({
            name,
            email,
            password,
            apiKey:uuidv4(),
        })
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt);
        await user.save();
        res.json({
            msg: "User Registered Successfully",
            user: user
        })
        
    } catch (error) {
        console.error({errorMessage: error});
        res.status(500).send('Server Error')
        
    }
});

module.exports = router;