const fs = require('fs')
const path = require('path')

const tokensPath = path.join(__dirname, 'tokens.json')

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
          text: 'Идентификатор'
        })

        continue
      }

      if (delimiters.includes(construction)) {
        table.push({
          value: construction,
          text: 'Разделитель'
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
                text: 'Разделитель'
              })
            } else {
              table.push({
                value: symbol,
                text: 'Литерал'
              })
            }
          })
      }

      if (isLiteral) {
        table.push({
          value: construction,
          text: 'Литерал'
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
  console.table(table)
}

module.exports = {
  lexer
}
