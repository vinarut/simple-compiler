const fs = require('fs')
const path = require('path')
const compiler = require('./compiler')

const codePath = path.join(__dirname, 'code.txt')

const readFile = (path, callback) => {
  fs.readFile(path, 'utf-8', (err, content) => {
    if (err) throw new Error(err)

    callback(content)
  })
}

readFile(codePath, code => {
  compiler.lexer(code)
})
