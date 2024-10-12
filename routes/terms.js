const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const authorize = require('../middleware/authorize');
const Term = require('../models/Term');
const rateLimiter = require('../middleware/rateLimit');
const usageLogger = require('../middleware/usageLogger');
const domainWhitelist = require('../middleware/domainWhitelist')


//NOTE

//GET /api/terms/search/python?context=programming
//@routes 

//To be implement in upcoming days


// @route   GET /api/terms
// @desc    Get all terms
// @access  Private (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
    const { page = 1, limit = 10, sort = 'term', order = 'asc' } = req.query;
  
    try {
      const terms = await Term.find()
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));
  
      const count = await Term.countDocuments();
  
      res.json({
        terms,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
//Getting all the list of term from the DB
// Endpoint to get the list of terms
router.get('/list', domainWhitelist, async (req, res) => {
  try {
    const terms = await Term.find().select('term synonyms');
    res.json(terms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//@route  GET /api/v1/terms/:term
//@desc GET definition of a term
//@acess Public

router.get('/:term', auth, domainWhitelist, rateLimiter, usageLogger, async (req, res) => {
  const origin = req.headers.origin || req.headers.referer;
    const checkParam = req.params.term;
    if (!checkParam) {
        return res.status(400).json({ msg: 'Term is required' });
    }
    const searchTerm = req.params.term.toLowerCase();
    try {
        const term = await Term.findOne({
            $or: [
                { term: searchTerm },
                { synonyms: searchTerm },
                { term: { $regex: new RegExp(searchTerm, 'i') } },
                { synonyms: { $regex: new RegExp(searchTerm, 'i') } }
            ],
        });
        if (!term) {
            return res.status(404).json({ msg: 'Term not Found' });
        }
        res.json(term);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})

// @route   POST/api/v1/terms
// @desc    Add a new term
// @access  Private (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {

    const { term, description, synonyms } = req.body;
    if (!term || !description) {
        return res.status(400).json({ msg: 'Term and description are required' });
    }
    try {
        let existingTerm = await Term.findOne({ term: term.toLowerCase() });
        if (existingTerm) {
            return res.status(400).json({ msg: 'Term already exists' });
        }
        const newTerm = new Term({
            term,
            description,
            synonyms
        });
        await newTerm.save();
        res.json(newTerm);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }

})

// @route   GET /api/v1/terms/:id
// @desc    Get a single term by ID
// @access  Private (admin only)
//getting the term with the ID
router.get('/:id', auth,authorize('admin'), async (req, res) => {
    try {
      const term = await Term.findById(req.params.id);
      if (!term) {
        return res.status(404).json({ msg: 'Term not found' });
      }
      res.json(term);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Term not found' });
      }
      res.status(500).send('Server Error');
    }
  });
  

// @route   POST /api/v1/terms/:id
// @desc    Update existing term
// @access  Private (admin only)
//updating the Term with the Term ID
router.put('/:id',auth, authorize('admin'),async (req,res)=>{
const {description, synonyms} = req.body;

  // Build update object
  const updateFields = {};
  if (description) updateFields.description = description;
  if (synonyms) updateFields.synonyms = synonyms;
  try {
    //finding in db to check it is present or not
    let term = await Term.findById(req.params.id);
    if (!term) {
      return res.status(404).json({ msg: 'Term not found' });
    }

    //present in db now updating it with new data
    term = await Term.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    res.json(term);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})


// @route   POST /api/v1/terms/:id
// @desc    delete a term
// @access  Private (admin only)
//deleting a term with the ID
router.delete('/:id', auth, authorize('admin'), async (req, res) => {

    try {
      const term = await Term.findById(req.params.id);
      if (!term) {
        return res.status(404).json({ msg: 'Term not found' });
      }
  
      await term.remove();
      res.json({ msg: 'Term removed' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


  
module.exports = router;