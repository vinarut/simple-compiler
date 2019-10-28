const fs = require('fs')
const path = require('path')
const compiler = require('./compiler')

const codePath = path.join(__dirname, 'code.txt')

const code = fs.readFileSync(codePath, 'utf-8')

compiler.lexer(code)