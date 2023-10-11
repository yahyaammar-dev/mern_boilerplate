const asyncHanlder = require("express-async-handler")
const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
// @desc Register a user
// @route POST /api/users/register
// @access private
const registerUser = asyncHanlder(async (req, res) => {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
        res.status(400)
        throw new Error("All fields are mandatory")
    }
    const userAvailable = await User.findOne({ email })
    if (userAvailable) {
        res.status(400)
        throw new Error("User already registered!")
    }
    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
        username,
        email,
        password: hashedPassword
    })
    console.log(`User created, ${user}`)
    if (user) {
        res.status(201).json({ _id: user.id, email: user.email })
    } else {
        res.status(400)
        throw new Error("User data is not valid")
    }
    res.status(404).json("Something is not right")
})

// @desc Login a user
// @route POST /api/users/login
// @access private
const loginUser = asyncHanlder(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        res.status(400)
        throw new Error("All fields are mandatory")
    }
    const user = await User.findOne({ email })
    //compare password with hashedpassword
    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user.id
            }
        }, process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30m'})
        res.status(200).json({ accessToken })
    }else{
        res.status(401)
        throw new Error('Email or Password is not valid')
    }
    res.json({ message: "Something is wrong" })
})

// @desc Register a user
// @route GET /api/users/current
// @access private
const currentUser = asyncHanlder(async (req, res) => {
    res.json(req.user)
})

module.exports = { registerUser, loginUser, currentUser }