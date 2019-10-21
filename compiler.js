const fs = require('fs')
const path = require('path')

const tokensPath = path.join(__dirname, 'tokens.json')

const lexer = code => {
  const { identifiers, delimiters } = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'))

  const table = []

  for (let line of code.split('\n')) {
    if (line.includes('//')) {
      table.push({
        value: line.replace('//', '').trim(),
        text: 'Комментарий'
      })

      continue
    }

    for (let identifier of identifiers) {
      if (line.includes(identifier)) {
        table.push({
          value: identifier,
          text: 'Идентификатор'
        })

        line = line.replace(identifier, '').trim()
      }
    }

    for (let delimiter of delimiters) {
      if (line.includes(delimiter)) {
        table.push({
          value: delimiter,
          text: 'Разделитель'
        })

        line = line.replace(delimiter, '').trim()
      }
    }

    line
      .split('')
      .filter(Boolean)
      .filter(item => item !== ' ')
      .forEach(item => {
        if (identifiers.includes(item)) {
          table.push({
            value: item,
            text: 'Идентификатор'
          })
        } else if (delimiters.includes(item)) {
          table.push({
            value: item,
            text: 'Разделитель'
          })
        } else {
          table.push({
            value: item,
            text: 'Литерал'
          })
        }
      })
  }

  console.table(table)
}

module.exports = {
  lexer
}
