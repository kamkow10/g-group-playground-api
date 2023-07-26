const express = require('express');
const bodyParser = require('body-parser')
const crypto = require('crypto');
const cors = require('cors')
const app = express();
const port = 3000;
app.use(cors());

let userSessionData = {};

let tasks = {
    todo: ['Clean desk', 'Make coffee', 'Learn NgRx', 'Learn Material', 'Drink coffee', 'Push changes'],
    done: ['Initialize project', 'Eat breakfast']
};

const jsonParser = bodyParser.json()

app.post('/login', jsonParser, (req, res) => {
    const username = req.body?.username;
    const password = req.body?.password;
    if (!username || !password) {
        return res.status(400).send('Incorrect input data');
    }
    if (username === 'globe' && password === 'group') {
        userSessionData = {
            token: crypto.randomBytes(20).toString('hex'),
            expiredTime: Date.now() + 60 * 1000 // 60s token validity
        }
        res.send(userSessionData);
    } else {
        res.status(400).send("Invalid Credentials");
    }
});

app.post('/getTasks', jsonParser, (req, res) => {
    const token = req.body?.token;
    if (!token || token !== userSessionData.token) {
        return res.status(401).send("Invalid Token");
    }
    if (!userSessionData.expiredTime || userSessionData.expiredTime <= Date.now()) {
        return res.status(401).send("Token Expired");
    }
    res.send(tasks);
})

app.post('/setTasks', jsonParser, (req, res) => {
    if (req.body?.token !== userSessionData.token) {
        return res.status(401).send("Invalid Token");
    }
    if (userSessionData.expiredTime <= Date.now()) {
        return res.status(401).send("Token Expired");
    }
    if (!req.body?.tasks) {
        return res.status(400).send('Incorrect input data');
    }
    tasks = req.body.tasks;
    return res.status(200).end();
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});