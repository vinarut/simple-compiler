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
        if (construction.includes(delimiter)) {
          isLiteral = false
          let unresolved = construction.split(delimiter).map(item => {
            item = item.replace('\r', '')
            return item
          })
          console.log(unresolved)

          if (unresolved.length > 1) {
            if (identifiers.includes(unresolved[0])) {
              table.push({
                value: unresolved[0],
                text: 'Идентификатор'
              })
            } else if (delimiters.includes(unresolved[0])) {
              table.push({
                value: unresolved[0],
                text: 'Разделитель'
              })
            } else {
              table.push({
                value: unresolved[0],
                text: 'Литерал'
              })
            }

            table.push({
              value: delimiter,
              text: 'Разделитель'
            })

            if (identifiers.includes(unresolved[1])) {
              table.push({
                value: unresolved[1],
                text: 'Идентификатор'
              })
            } else if (delimiters.includes(unresolved[1])) {
              table.push({
                value: unresolved[1],
                text: 'Разделитель'
              })
            } else {
              table.push({
                value: unresolved[1],
                text: 'Литерал'
              })
            }

            continue
          }

          if (unresolved.length === 1) {
            if (identifiers.includes(unresolved[0])) {
              table.push({
                value: unresolved[0],
                text: 'Идентификатор'
              })
            } else if (delimiters.includes(unresolved[0])) {
              table.push({
                value: unresolved[0],
                text: 'Разделитель'
              })
            } else {
              table.push({
                value: unresolved[0],
                text: 'Литерал'
              })
            }

            table.push({
              value: delimiter,
              text: 'Разделитель'
            })

            continue
          }

          table.push({
            value: delimiter,
            text: 'Разделитель'
          })
        }
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
