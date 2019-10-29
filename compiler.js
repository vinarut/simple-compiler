const fs = require('fs')
const path = require('path')

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
          text: 'Идентификатор',
          key: 'term'
        })

        continue
      }

      if (delimiters.includes(construction)) {
        table.push({
          value: construction,
          text: 'Разделитель',
          key: 'del'
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
                text: 'Разделитель',
                key: 'del'
              })
            } else {
              table.push({
                value: symbol,
                text: 'Литерал',
                key: 'lit'
              })
            }
          })
      }

      if (isLiteral) {
        table.push({
          value: construction,
          text: 'Литерал',
          key: 'lit'
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

  const lits = [...new Set(table.filter(item => item.key === 'lit').map(item => item.value))]

  const codeLiterals = lits.filter(Number)
  const codeIdents = lits.filter(item => !codeLiterals.includes(item))

  const indexes = table
    .map(item => {
      if (item.key === 'term') {
        return { table: 1, position: terminals.findIndex(terminal => terminal === item.value) }
      }

      if (item.key === 'del') {
        return { table: 2, position: delimiters.findIndex(delimiter => delimiter === item.value) }
      }

      if (item.key === 'lit') {
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
