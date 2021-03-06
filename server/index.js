const express = require('express');
const app = express();
const port = 5000;

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const {User} = require('./models/User');


// application/x-www-form-urlencoded 이렇게 된 데이터를 분석해서 가져옴
app.use(bodyParser.urlencoded({extended: true}))
// application/json
app.use(bodyParser.json())
app.use(cookieParser())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World! hi'))

app.get('/api/hello', (req, res) => {
  res.send("hi~")
})

app.post('api/users/register', (req, res) => {
  // 회원가입 할 때 필요한 정보들을 client에서 가져오면 그것들을 데이터베이스에 넣어준다.

  // bodyparser를 이용해서 req.body로 client에서 보내는 정보를 받아온다
  const user = new User(req.body)

  // mongoDB method
  user.save((err, userInfo) => {
    if (err) return res.json({success: false, err}) // 저장할 때 에러가 발생하면
    return res.status(200).json({success: true})
  })  
})

app.post('/api/users/login', (req, res) => {
  // 요청된 이메일을 DB에 있는지 찾는다
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }

  // DB에 있다면 비밀번호가 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
      return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})
      
  // 비밀번호가 맞다면 유저를 위한 token 생성
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);

        // token을 저장한다. 어디에? 쿠키, 로컬스토리지 등
        res.cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess:  true, userId: user._id }) 
      })
    })
  })
})

// role === 0 일반유저, role !== 0 관리자 
app.get('api/users/auth', auth, (req, res) => {
  // 여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True 라는 말임
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    Image: req.user.image
  })
})

app.get('api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id},
    {token: ""},
    (err, user) => {
      if(err) return res.json({success: false, err});
      return res.status(200).send({
        success: true
      })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))