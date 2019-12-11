const fs = require('fs')
const path = require('path')
const {
  LITERAL,
  DELIMITER,
  IDENTIFIER,
  IDENTIFIER_TABLE_ID,
  DELIMITER_TABLE_ID,
  LITERAL_NUMBER_TABLE_ID,
  LITERAL_VARIABLE_TABLE_ID
} = require('./constants')

const tokensPath = path.join(__dirname, 'tokens.json')
const outputPath = path.join(__dirname, 'output.json')
const identPath = path.join(__dirname, 'identifiers.json')
const literalsPath = path.join(__dirname, 'literals.json')
const indexesPath = path.join(__dirname, 'indexes.json')

const { keywords, delimiters } = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'))

let output = []

const regular = /^[a-zA-Z_$]+\w*/
const numberRegular = /^[\d]+$/

const isKeyword = str => keywords.includes(str)
const isDelimiter = str => delimiters.includes(str)
const isValidLiteral = literal => regular.test(literal) || numberRegular.test(literal)
const add = (value, key) => output.push({ value, key })

const lexer = code => {
  for (let line of code.split('\n')) {
    if (line.startsWith('//')) {
      continue
    } else {
      line = line.split('//').shift()
    }

    for (let construction of line.split(' ')) {
      if (!construction) continue

      if (isKeyword(construction)) {
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
            } else if (isValidLiteral(symbol)) {
              add(symbol, LITERAL)
            } else {
              throw new Error(`Invalid literal ${symbol}`)
            }
          })

        break
      }

      if (isLiteral) {
        if (isValidLiteral(construction)) {
          add(construction, LITERAL)
        } else {
          throw new Error(`Invalid literal ${construction}`)
        }
      }
    }
  }

  output = output
    .filter(item => item.value)
    .map(item => ({
      ...item,
      value: item.value.replace('\r', '')
    }))

  const lits = [...new Set(output.filter(({ key }) => key === LITERAL).map(item => item.value))]

  const codeLiterals = lits.filter(Number)
  const codeIdents = lits.filter(item => !codeLiterals.includes(item))

  const indexes = output
    .map(({ key, value }) => {
      if (key === IDENTIFIER) {
        return { id: IDENTIFIER_TABLE_ID, index: keywords.findIndex(terminal => terminal === value) }
      }

      if (key === DELIMITER) {
        return { id: DELIMITER_TABLE_ID, index: delimiters.findIndex(delimiter => delimiter === value) }
      }

      if (key === LITERAL) {
        const literalId = codeLiterals.findIndex(lit => lit === value)
        const identId = codeIdents.findIndex(idt => idt === value)

        if (literalId > -1) {
          return { id: LITERAL_VARIABLE_TABLE_ID, index: literalId }
        }

        if (identId > -1) {
          return { id: LITERAL_NUMBER_TABLE_ID, index: identId }
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
