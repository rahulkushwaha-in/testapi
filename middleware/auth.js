const User = require('../models/user')

module.exports = async function (req,res,next){
    const apiKey = req.header('x-api-key');
    if(!apiKey){
        return res.status(401).json({
            msg: 'No API key, Authorization Denied'
        })
    }
    try {
        const user =  await User.findOne({apiKey});
    if(!user){
     return res.status(401).json({
        msg: 'Invalid API Key'
     })   
    }
    req.user = user;
    next();

    } catch (error) {
        console.error({
            errorMessage: error.message
        });
        res.status(500).send("Server Error");
    }
}