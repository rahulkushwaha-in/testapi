const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const Term = require('../models/Term');

//@route  GET /api/terms/:term
//@desc GET definition of a term
//@acess Public

router.get('/:term', auth, async (req,res)=>{
    try {
        const term = await Term.findOne({term: req.params.term.toLowerCase()});
        if(!term){
            return res.status(404).json({msg:'Term not Found'});
        }
        res.json(term);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})
module.exports = router;