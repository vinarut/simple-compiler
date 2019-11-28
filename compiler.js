const fs = require('fs')
const path = require('path')
const {LITERAL, DELIMITER, IDENTIFIER} = require('./constants')

const tokensPath = path.join(__dirname, 'tokens.json')
const tablePath = path.join(__dirname, 'table.json')
const identPath = path.join(__dirname, 'identifiers.json')
const literalsPath = path.join(__dirname, 'literals.json')
const indexesPath = path.join(__dirname, 'indexes.json')

const lexer = code => {
  const { terminals, delimiters } = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'))

  let table = []

  for (let line of code.split('\n')) {
    if (line.includes('//')) {
      continue
    }

    for (let construction of line.split(' ')) {
      if (terminals.includes(construction)) {
        table.push({
          value: construction,
          type: IDENTIFIER
        })

        continue
      }

      if (delimiters.includes(construction)) {
        table.push({
          value: construction,
          type: DELIMITER
        })

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
            if (delimiters.includes(symbol)) {
              table.push({
                value: symbol,
                type: DELIMITER
              })
            } else {
              table.push({
                value: symbol,
                type: LITERAL
              })
            }
          })
      }

      if (isLiteral) {
        table.push({
          value: construction,
          type: LITERAL
        })
      }
    }
  }

  table = table
    .filter(item => item.value)
    .map(item => {
      item.value = item.value.replace('\r', '')
      return item
    })

  const lits = [...new Set(table.filter(item => item.type === LITERAL).map(item => item.value))]

  const codeLiterals = lits.filter(Number)
  const codeIdents = lits.filter(item => !codeLiterals.includes(item))

  const indexes = table
    .map(item => {
      if (item.type === IDENTIFIER) {
        return { table: 1, position: terminals.findIndex(terminal => terminal === item.value) }
      }

      if (item.type === DELIMITER) {
        return { table: 2, position: delimiters.findIndex(delimiter => delimiter === item.value) }
      }

      if (item.type === LITERAL) {
        const literalId = codeLiterals.findIndex(lit => lit === item.value)
        const identId = codeIdents.findIndex(idt => idt === item.value)

        if (literalId > -1) {
          return { table: 3, position: literalId }
        }

        if (identId > -1) {
          return { table: 4, position: identId }
        }
      }
    })
    .filter(Boolean)

  fs.writeFileSync(tablePath, JSON.stringify(table))
  fs.writeFileSync(identPath, JSON.stringify(codeIdents))
  fs.writeFileSync(literalsPath, JSON.stringify(codeLiterals))
  fs.writeFileSync(indexesPath, JSON.stringify(indexes))
}

module.exports = {
  lexer
}
