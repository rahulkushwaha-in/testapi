const express = require('express')
const helmet = require('helmet');
const morgan = require('morgan')
const connectDB = require('./config/db');
const app = express();
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const cors = require('cors');
const domainWhitelist = require('./middleware/domainWhitelist');
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
dotenv.config()
//connecting to mongo database function 
connectDB();

//for security middleware
app.use(helmet());

//for enabling cors
app.use(cors());

// for json parsing
app.use(express.json());

//for http request logging
app.use(morgan('combined'));

// app.use(async (req, res, next) => {
//   await domainWhitelist(req, res, () => {
//     const origin = req.headers.origin || req.headers.referer;
//     res.header('Access-Control-Allow-Origin', origin);
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, x-client-id');
//     next();
//   });
// });

//applying rate limiting to all the requests
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max:100, //limit the request from one particular IP address in the span of the above time mentioned which is windowMS
// });

// app.use(limiter);



//routes
app.use('/api/v1/auth', require('./routes/auth'))
app.use('/api/v1/terms', require('./routes/terms'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/admin', require('./routes/admin'));
app.use('/widgets', require('./routes/widgets'));


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
