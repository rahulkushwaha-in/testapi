const User = require('../models/user')
const jwt = require('jsonwebtoken');


module.exports = async function (req, res, next) {
  const apiKey = req.header('x-api-key');
  //getting the token header
  const token = req.header('x-auth-token');
  //check for api key or token
  if (!apiKey || !token) {
    return res.status(401).json({
      msg: 'No token or API key, authorization denied'
    })
  }
  try {

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Extract user ID from token
    const userId = decoded.user.id;

    // Query the database to find the user with the given ID and API key
    const user = await User.findOne({ _id: userId, apiKey });
    if (!user) {
      return res.status(401).json({ msg: 'Invalid token or API key' });
    }
    // Attach user information to the request object
    req.user = {
      id: user._id,
      role: user.role,
    };
    // Continue to the next middleware or route handler
    next();

  } catch (error) {
    console.error({
      errorMessage: error.message
    });
    res.status(500).send("Server Error");
  }
}