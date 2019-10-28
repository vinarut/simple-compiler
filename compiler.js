const fs = require('fs')
const path = require('path')

const tokensPath = path.join(__dirname, 'tokens.json')
const tablePath = path.join(__dirname, 'table.json')
const identPath = path.join(__dirname, 'ident.json')
const literalsPath = path.join(__dirname, 'literals.json')
const resultPath = path.join(__dirname, 'result.json')

const lexer = code => {
  const { identifiers, delimiters } = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'))

  let table = []

  for (let line of code.split('\n')) {
    if (line.includes('//')) {
      table.push({
        value: line
          .split('//')
          .pop()
          .trim(),
        text: 'Комментарий'
      })

      continue
    }

    for (let construction of line.split(' ')) {
      if (identifiers.includes(construction)) {
        table.push({
          value: construction,
          text: 'Идентификатор',
          key: 'ident'
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

  const result = table
    .map(item => {
      if (item.key === 'ident') {
        return { table: 1, position: identifiers.findIndex(identifier => identifier === item.value) }
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
  fs.writeFileSync(resultPath, JSON.stringify(result))
}

module.exports = {
  lexer
}
