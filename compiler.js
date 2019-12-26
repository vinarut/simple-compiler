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

const output = []

const removeSpecificChars = code => {
  const newCode = code
    .replace('\n', '')
    .replace('\r', '')
    .replace('\t', '')
  return code !== newCode ? removeSpecificChars(newCode) : code.trim()
}

const parseElement = element => {
  if (!element) return

  const separator = getSeparator(element)

  if (separator) {
    const [left, right] = element.split(separator)
    parseElement(left)
    add(separator, DELIMITER)
    parseElement(right)

    return
  }

  if (isKeyword(element)) {
    add(element, IDENTIFIER)
    return
  }

  if (isDelimiter(element)) {
    add(element, DELIMITER)
    return
  }

  if (isVariable(element) || isNumber(element)) {
    add(element, LITERAL)
  } else {
    throw new Error(`Lexer finished with error. Unexpected token '${element}'`)
  }
}

const getSeparator = str => delimiters.find(d => str.includes(d))

const isKeyword = str => keywords.includes(str)
const isDelimiter = str => delimiters.includes(str)
const isVariable = literal => /^[a-zA-Z_$]+\w*/.test(literal)
const isNumber = value => /^[\d]+$/.test(value) && isFinite(value)
const add = (value, key) => output.push({ value, key })

const write = () => {
  const literals = [...new Set(output.filter(({ key }) => key === LITERAL).map(item => item.value))]

  const numberLiterals = literals.filter(isNumber)
  const variableLiterals = literals.filter(item => !numberLiterals.includes(item))

  const indexes = output.map(({ key, value }) => {
    if (key === IDENTIFIER) {
      return { id: IDENTIFIER_TABLE_ID, index: keywords.findIndex(terminal => terminal === value) }
    }

    if (key === DELIMITER) {
      return { id: DELIMITER_TABLE_ID, index: delimiters.findIndex(delimiter => delimiter === value) }
    }

    if (key === LITERAL) {
      const literalId = variableLiterals.findIndex(lit => lit === value)
      const identId = numberLiterals.findIndex(lit => lit === value)

      if (literalId > -1) {
        return { id: LITERAL_VARIABLE_TABLE_ID, index: literalId }
      }

      if (identId > -1) {
        return { id: LITERAL_NUMBER_TABLE_ID, index: identId }
      }
    }
  })

  fs.writeFileSync(outputPath, JSON.stringify(output))
  fs.writeFileSync(identPath, JSON.stringify(variableLiterals))
  fs.writeFileSync(literalsPath, JSON.stringify(numberLiterals))
  fs.writeFileSync(indexesPath, JSON.stringify(indexes))
}

const lexer = code => {
  removeSpecificChars(code)
    .split(' ')
    .filter(Boolean)
    .forEach(parseElement)
  write()
}

const parser = () => {}

module.exports = {
  lexer,
  parser
}
