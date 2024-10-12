// middleware/domainWhitelist.js
const User = require('../models/user');

module.exports = async function (req, res, next) {
  const clientId = req.header('x-client-id') || req.query.clientId;
  const origin = req.headers.origin || req.headers.referer;

  if (!clientId || !origin) {
    return res.status(403).json({ msg: 'Forbidden: Missing client ID or origin' });
  }

  try {
    const user = await User.findOne({ clientId });
    if (!user) {
      return res.status(403).json({ msg: 'Forbidden: Invalid client ID' });
    }

    // Extract domain from origin
    const url = new URL(origin);
    const domain = url.hostname;

    if (!user.domains.includes(domain)) {
      return res.status(403).json({ msg: 'Forbidden: Domain not whitelisted' });
    }

    // Set CORS headers
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-client-id');

    // Attach user to request for downstream use
    req.user = user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};
