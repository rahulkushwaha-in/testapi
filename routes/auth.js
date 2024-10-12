const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');;
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');

//importing validator
const { check, validationResult } = require('express-validator');

//registering a new user
router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role must be either user or admin').optional().isIn(['user', 'admin']),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, plan, domains } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }
        // Create new user
        user = new User({
            name,
            email,
            password,
            apiKey: uuidv4(),
            role: role || 'user',
            plan: plan || 'basic',
            clientId: uuidv4(),
            domains: domains ? [domains] : [], // Handle null domains
        });
        console.log(user);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                role: user.role,
            },
        };

        // Sign JWT token
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) {
                console.error('Error signing JWT:', err);
                return res.status(500).send('Server Error');
            }
            res.json({
                msg: "User registered successfully",
                user,
                token,
                apiKey: user.apiKey,
            });
        });

    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error
            console.error("Duplicate key error:", error.message);
            return res.status(400).json({ msg: "Duplicate key error" });
        } else {
            // Other errors
            console.error("Error during registration:", error);
            return res.status(500).send('Server Error');
        }
    }
});


router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    const { email, password } = req.body;
    try {
        //check if user has account or not
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                msg: "Invalid Credentials"
            })
        }
        //check if password is correct or not
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                msg: "Invalid Credentials"
            })
        }
        // create jwt payload
        const payload = {
            user: {
                id: user.id,
                role: user.role,
            },
        };
        //sign jwt token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, // Token expired In
            (err, token) => {
                if (err) throw err;
                res.json({
                    msg: "User Logged In Successfully",
                    user: user,
                    token,
                    apiKey: user.apiKey
                });
            })

    } catch (err) {
        console.error({ errorMessage: err });
        res.status(500).send('Server Error');
    }

})

router.post('')

module.exports = router;