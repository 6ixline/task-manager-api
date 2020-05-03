const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOneId, setUpDatabase, userOne, userTwo, taskOne } = require('./fixtures/db')

beforeEach(setUpDatabase)

test('should create task', async ()=>{
    const res = await request(app)
    .post('/tasks')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        description:'Task from test'
    })
    .expect(201)

    const task = await Task.findById(res.body._id)
    expect(task).not.toBeNull()

    expect(task.completed).toEqual(false)

})

test('Should get all task for userOne',async()=>{
    const res = await request(app)
    .get('/tasks')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(res.body.length).toBe(2)
})

test('Should not delete task of first user by second user', async()=>{
    
    await request(app)
    .delete('/tasks/'+taskOne._id)
    .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})