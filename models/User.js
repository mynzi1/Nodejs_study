const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,     // reduce space
        unique: 1
    },
    password: {
        type: String,
        maxlength: 50
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    rold: {
        type: Number,
        default: 0  // role을 지정하지 않으면
    },
    image: String,
    token: {    // 유효성 관리
        type: String
    },
    tokenExp: {     // 토큰 유효기간
        type: Number
    }
})

const User = mongoose.model('User', userSchema)

module.exports = {User}