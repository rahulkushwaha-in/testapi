const express = require('express')
const cors = require('cors')
const helmet = require('helmet');
const morgan = require('morgan')
const connectDB = require('./config/db');
const app = express();
const dotenv = require('dotenv')
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
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

//applying rate limiting to all the requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max:100, //limit the request from one particular IP address in the span of the aboe time mentioned which is windowMS
});

app.use(limiter);



//routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/terms',require('./routes/terms'));



const PORT = process.env.PORT || 5001;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`); 
})
