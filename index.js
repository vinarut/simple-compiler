const compiler = require('./compiler')

const example1 = `
  var a = 1;
  var b;
`

const example2 = `
  let a = 1;
  let c = 0;

  if (a > 0) {
    c = c + 1;
  }
`

const example3 = `
  var a=2;
  let b = 3;
  const c = a + b;
  while (b > 1) {
    a = c - b;
    b = b - 1;
  }
`

compiler.lexer(example1)
