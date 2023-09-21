const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Notes = require('../models/Notes')
const { body, validationResult } = require('express-validator');


//ROUTE 1: TO FETCH ALL NOTES
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
});

//ROUTE 2: TO ADD A NOTE 
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid name').isLength({ min: 3 }),
    body('description', 'Description should contain atleast 5 charcters').isLength({ min: 5 }),
    

], async (req, res) => {
    try {
        const {title, description, tag} = req.body;
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const note = new Notes({
        title, description, tag, user: req.user.id
    });
    const savedNote = await note.save();
    res.json(savedNote);
    } catch (error) {
        
    }
});

//ROUTE 3: UPDATE AN EXISTING NOtE
router.put('/updatenote/:id', fetchuser, async(req,res)=>{
    const{title, description, tag} = req.body;
    const newNote = {}
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};

    let note = await Notes.findById(req.params.id);
    if(!note){return res.status(404).send('Not Found')};

    if(note.user.toString() !== req.user.id){return res.status(401).send("Not Allowed")}

    note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true}) 
    res.send({note});
});

router.delete('/deletenote/:id', fetchuser, async(req,res)=>{
    const{title, description, tag} = req.body;
    

    let note = await Notes.findById(req.params.id);
    if(!note){return res.status(404).send('Not Found')};

    if(note.user.toString() !== req.user.id){return res.status(401).send("Not Allowed")}

    note = await Notes.findByIdAndDelete(req.params.id) 
    res.json({"success" : "Note has been delete", note:note } );
});




module.exports = router;