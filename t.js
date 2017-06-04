const validate = require('./models/user/update.js').validate;

const user = {
      email: 'nou@nou'
    };
const result = validate(user);

console.log(result);