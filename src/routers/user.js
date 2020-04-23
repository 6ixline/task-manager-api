const express = require('express')
const multer = require('multer')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendDeleteAccountEmail } = require('../emails/accounts')
const route = new express.Router()


// creating endpoint for users
route.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e.message)
    }

})

// user login endpoint

route.post('/users/login',async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})
// user logout route
route.post('/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    }catch{
        res.status(500).send(e.message)
    }
})


route.post('/users/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()

    }catch(e){
        res.status(500).send(e.message)
    }
})
// reading data endpoint for users

route.get('/users/me', auth,async (req, res) => {
    res.send(req.user)
})

// updating endpoint for users

route.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowed = ['name', 'email', 'password', 'age']
    const isValid = updates.every(update => allowed.includes(update))

    if (!isValid) {
        return res.status(400).send({ error: 'Invaild Update!' })
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e.message)
    }
})
// delete endpoint for user
route.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendDeleteAccountEmail(req.user.email,req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e.message)
    }
})
// upload image endpoint
const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined,true)
    }
})

route.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
    // const buffer = await sharp(req.file.buffer).resize({ height:250 , width:250 }).png().toBuffer() 
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
},(err,req,res,next)=>{
    res.status(400).send({ error: err.message })
})

// deleting avatar endpoint

route.delete('/users/me/avatar', auth, async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})


route.get('/users/:id/avatar', async(req,res)=>{
   try{
       const user = await User.findById({ _id: req.params.id })
       if (!user || !user.avatar) {
          throw new Error()
       }
       res.set('Content-Type', 'image/jpg')
       res.send(user.avatar)
   }catch(e){
        res.status(404).send()
   }
})


module.exports = route