const asyncHanlder = require("express-async-handler")

const Contact = require("../models/contactModel")

// @desc Get all contacts
// @route GET /api/contacts
// @access public

const getContacts = asyncHanlder(async (req, res) => {
    const contacts = await Contact.find({user_id: req.user.id})
    res.status(200).json(contacts)
})

// @desc Get contacts
// @route GET /api/contacts/:id
// @access public

const getContact = asyncHanlder(async (req, res) => {
    try{
        const contact = await Contact.findById(req.params.id) // it is null
        if(contact == null){
            res.status(404)  // instead of going here 
            throw new Error('Contact Not Found')
        }else{
            if(contact.user_id != req.user.id){
                console.log('hello')
                res.status(403) // it goes here
                throw new Error("Forbidden! You do not have access for this contact")      
            }
            res.status(200).json(contact)
        }
        
    }catch(error){
        res.status(404) // it goes here
        throw new Error("Not Found the contact")
    }
})


// @desc Create New contact
// @route POST /api/contacts
// @access public

const createContact = asyncHanlder(async (req, res) => {
    const { name, email, phone } = req.body

    if (!name || !email || !phone) {
        res.status(400)
        throw new Error("All fields are Mendatory")
    }

    const contact = await Contact.create({
        name,
        email,
        phone,
        user_id: req.user.id
    })

    res.status(201).json(contact)
})

// @desc Update New contact
// @route PUT /api/contacts
// @access public

const updateContact = asyncHanlder(async (req, res) => {
    const contact = await Contact.findById(req.params.id)
    if(!contact){
        res.status(404)
        throw new Error("Contact not found")
    }

    if(contact.user_id.toString() !== req.user.id){
        res.status(403)
        throw new Error("Usre don't have permission to update other user contacts")
    }

    const updatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true
        }
    )
    res.status(200).json(updatedContact)
})


// @desc Delete Contact
// @route DELETE /api/contacts/:id
// @access public

const deleteContact = asyncHanlder(async (req, res) => {
    const contact = await Contact.findById(req.params.id)
    if(!contact){
        res.status(404)
        throw new Error("Contact not found")
    }
    if(contact.user_id.toString() !== req.user.id){
        res.status(403)
        throw new Error("Usre don't have permission to delete other user contacts")
    }
    await contact.deleteOne()
    res.status(200).json(contact)
})


module.exports = { getContacts, createContact, getContact, updateContact, deleteContact }