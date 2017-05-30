const schema = require('validate');

const user = schema({
  username: {
    required: [
      true,
      'требуется username'
    ],
    type: [
      'string',
      'username должен иметь тип string' 
    ],
    match: [
      /^[a-zA-Z][a-zA-Z0-9-_\.]{2,12}$/,
      'username должен начинаться с буквы и может состоять из букв латинского алфавита, цифр и знаков ".", "-", "_"'
    ]
  },
  password: {
    required: [
      true,
      'требуется username'
    ],
    type: [
      'string',
      'username должен иметь тип string' 
    ],
    match: [
      /^[a-zA-Z][a-zA-Z0-9-_\.]{2,12}$/,
      'username должен начинаться с буквы и может состоять из букв латинского алфавита, цифр и знаков ".", "-", "_"'
    ]
  }
});

const usr1 = {
  username: '1asd'
};

const error = user.validate(usr1);

console.log(error);