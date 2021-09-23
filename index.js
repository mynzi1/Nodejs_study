const express = require('express');
const app = express();
const port = 5000;

const bodyParser = require('body-parser');
const {User} = require("./models/User");

const config = require('./config/key');

// application/x-www-form-urlencoded 이렇게 된 데이터를 분석해서 가져옴
app.use(bodyParser.urlencoded({extended: true}))
// application/json
app.use(bodyParser.json())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World! hi'))

app.post('/register', (req, res) => {
  // 회원가입 할 때 필요한 정보들을 client에서 가져오면 그것들을 데이터베이스에 넣어준다.

  // bodyparser를 이용해서 req.body로 client에서 보내는 정보를 받아온다
  const user = new User(req.body)

  // mongoDB method
  user.save((err, userInfo) => {
    if (err) return res.json({success: false, err}) // 저장할 때 에러가 발생하면
    return res.status(200).json({success: true})
  })  
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))