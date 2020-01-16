const compiler = require('./compiler')

const example1 = `
  let a, b, c;
  a = 10;
  b = 3;
  c = a + b;
`

const example2 = `
  let a, c;
  a = 1;
  c = 0;

  if (a > 0) {
    c = c + 1;
  } else {
    c = c - 1;
  }
`

const example3 = `
  let b, c;
  b = 3;
  c = b + 5;
  while(b > 1){
    a = c - b;
    b = b - 1;
  }
`

const expression = `
  let a;
  a = (6+10-4)/(1+1*2)+1;
`

compiler.lexer(expression)
compiler.parser()
