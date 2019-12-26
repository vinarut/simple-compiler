const compiler = require('./compiler')

const example1 = `
  let a, b, c;
  a = 10;
  b = 3;
  c = a + b;
`

const example2 = `
  let a = 1;
  let c = 0;

  if (a > 0) {
    c = c + 1;
  }
`

const example3 = `
  let b = 3;
  let c = b + 5;
  while(b > 1){
    a = c - b;
    b = b - 1;
  }
`

compiler.lexer(example1)
compiler.parser()
