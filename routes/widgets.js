// routes/widgets.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const User = require('../models/user');
const domainWhitelist = require('../middleware/domainWhitelist');


router.get('/widget.js', async (req, res) => {
    
  const { clientId } = req.query;

  try {
    const user = await User.findOne({ clientId });

    if (!user) {
      return res.status(404).send('Invalid client ID');
    }

    // Read the widget template file
    let widgetScript = fs.readFileSync(
      path.join(__dirname, '../public/widgets/widget-template.js'),
      'utf8'
    );

    // Replace placeholders with actual values
    widgetScript = widgetScript.replace(/%%CLIENT_ID%%/g, clientId);
    widgetScript = widgetScript.replace(/%%API_URL%%/g, process.env.API_URL);

    // Set appropriate content type
    res.type('application/javascript');
    res.send(widgetScript);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
