const fs = require('fs')
const path = require('path')
const { LITERAL, DELIMITER, IDENTIFIER } = require('./constants')

const tokensPath = path.join(__dirname, 'tokens.json')
const outputPath = path.join(__dirname, 'output.json')
const identPath = path.join(__dirname, 'identifiers.json')
const literalsPath = path.join(__dirname, 'literals.json')
const indexesPath = path.join(__dirname, 'indexes.json')

const { terminals, delimiters } = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'))

let output = []

const isIdentifier = str => terminals.includes(str)
const isDelimiter = str => delimiters.includes(str)
const add = (value, key) => output.push({ value, key })

const lexer = code => {
  for (let line of code.split('\n')) {
    if (line.includes('//')) {
      continue
    }

    for (let construction of line.split(' ')) {
      if (isIdentifier(construction)) {
        add(construction, IDENTIFIER)

        continue
      }

      if (isDelimiter(construction)) {
        add(construction, DELIMITER)

        continue
      }

      let isLiteral = true
      for (let delimiter of delimiters) {
        if (!construction.includes(delimiter)) continue

        isLiteral = false

        construction
          .trim()
          .split('')
          .forEach(symbol => {
            if (isDelimiter(symbol)) {
              add(symbol, DELIMITER)
            } else {
              add(symbol, LITERAL)
            }
          })
      }

      if (isLiteral) {
        add(construction, LITERAL)
      }
    }
  }

  output = output
    .filter(item => item.value)
    .map(item => ({
      ...item,
      value: item.value.replace('\r', '')
    }))

  const lits = [...new Set(output.filter(item => item.type === LITERAL).map(item => item.value))]

  const codeLiterals = lits.filter(Number)
  const codeIdents = lits.filter(item => !codeLiterals.includes(item))

  const indexes = output
    .map(item => {
      if (item.type === IDENTIFIER) {
        return { tableId: 1, index: terminals.findIndex(terminal => terminal === item.value) }
      }

      if (item.type === DELIMITER) {
        return { tableId: 2, index: delimiters.findIndex(delimiter => delimiter === item.value) }
      }

      if (item.type === LITERAL) {
        const literalId = codeLiterals.findIndex(lit => lit === item.value)
        const identId = codeIdents.findIndex(idt => idt === item.value)

        if (literalId > -1) {
          return { tableId: 3, index: literalId }
        }

        if (identId > -1) {
          return { tableId: 4, index: identId }
        }
      }
    })
    .filter(Boolean)

  fs.writeFileSync(outputPath, JSON.stringify(output))
  fs.writeFileSync(identPath, JSON.stringify(codeIdents))
  fs.writeFileSync(literalsPath, JSON.stringify(codeLiterals))
  fs.writeFileSync(indexesPath, JSON.stringify(indexes))
}

module.exports = {
  lexer
}
