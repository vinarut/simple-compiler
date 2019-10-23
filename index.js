const fs = require('fs')
const path = require('path')
const compiler = require('./compiler')

const codePath = path.join(__dirname, 'code.txt')
const tablePath = path.join(__dirname, 'table.json')

const code = fs.readFileSync(codePath, 'utf-8')

const table = compiler.lexer(code)

fs.writeFileSync(tablePath, JSON.stringify(table))
