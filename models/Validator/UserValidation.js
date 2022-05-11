const validator = require('validator');
const model = require('../userModel');
function isValid(username, pw1,pw2,email) {
   console.log(username, pw1, pw2, email);
   return(pw1.length>8 && pw1.length<16 && pw1==pw2 && validator.isStrongPassword(pw1) && validator.isAlphanumeric(username) && username.length<25 && validator.isEmail(email));
   // long line that returns true if the password is between 8 and 16 characters, the password and username passes the patten test
}

module.exports = {isValid}
