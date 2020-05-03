const request = require('supertest')
const app = require("../src/app")
const User = require('../src/models/user')
const { userOneId, setUpDatabase, userOne } = require('./fixtures/db')

beforeEach(setUpDatabase)

test('Should User Created',async ()=>{
    const response = await request(app).post('/users').send({
        name:'Sourabh',
        email:"thing@gmail.com",
        password:"Mypass!123"
    }).expect(201)

    // Asserting new thing for test
    // Assert that the database changed correctly

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assert about the response

    expect(response.body).toMatchObject({
        user:{
            name:'Sourabh',
            email: 'thing@gmail.com'
        },
        token:user.tokens[0].token
    })

    expect(user.password).not.toBe('Mypass!123')

})

test('should be login existing user',async()=>{
   const res =  await request(app).post('/users/login').send({
        email: userOne.email,
        password:userOne.password
    }).expect(200)

    // Assert to check token 
    const user = await User.findById(res.body.user._id)
    expect(user).not.toBeNull()

    expect(res.body).toMatchObject({
        token:user.tokens[1].token
    })
})

test('should not be login nonexisting user', async()=>{
    await request(app).post('/users/login').send({
        email:userOne.email,
        password:'password'
    }).expect(400)
})

test('should be show profile', async()=>{
    await request(app).get('/users/me')
    .set("Authorization",`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('should not get profile for unauthenticated user', async()=>{
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async()=>{
   await request(app)
    .delete('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async()=>{
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload image',async()=>{
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .attach('avatar','tests/fixtures/profile-pic.jpg')
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test("Should update valid user field",async ()=>{
    await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        name:'Sourabh'
    })
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe('Sourabh')
})

test('Should not update invalid user fields',async () =>{
    await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        location:'new delhi'
    })
    .expect(400)
})