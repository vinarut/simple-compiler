const fs = require('fs')
const path = require('path')
const { isNumber, comparison } = require('./utils')

const identPath = path.join(__dirname, 'output', 'identifiers.json')
const tokensPath = path.join(__dirname, 'tokens.json')

const { keywords } = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'))
const identifiers = JSON.parse(fs.readFileSync(identPath, 'utf-8'))

class Parser {
  #messages = {
    programStart: 'Program should begin with a definition using "let".',
    semi: 'Expected symbol ";".',
    comma: 'Expected symbol ",".',
    identifier: 'No such identifier.',
    assignment: 'Expected symbol "=".',
    conditionalExpressionStart: 'Expected symbol "(".',
    conditionalExpressionEnd: 'Expected symbol ")"',
    comparison: 'Expected comparison symbol.',
    bodyStart: 'Expected symbol "{".',
    bodyEnd: 'Expected symbol "}"',
    operand: 'Expression does not match operand.'
  }
  #current = {}

  constructor(program) {
    this.programText = Parser.generator(program)
    this.program()
  }

  static *generator(program) {
    for (const element of program) {
      yield element
    }
  }

  next() {
    if (this.isDone()) {
      process.exit(0)
    } else {
      this.#current = this.programText.next()
    }
  }

  isDone() {
    return this.#current.done
  }

  compareWithCurrent(symbol) {
    return symbol === this.#current.value
  }

  error(message = 'Unexpected symbol.') {
    throw new Error(message + ` Current symbol is '${this.#current.value}'`)
  }

  program() {
    this.next()
    if (this.#current.value !== 'let') {
      this.error(this.#messages.programStart)
    }

    this.next()
    this.declist()
    this.next()
    this.operlist()
  }

  declist() {
    if (!identifiers.some(this.compareWithCurrent.bind(this))) {
      this.error(this.#messages.identifier)
    }

    this.next()
    this.M()

    if (this.#current.value !== ';') {
      this.error(this.#messages.semi)
    }
  }

  M() {
    if (this.#current.value === ',') {
      this.next()
      this.declist()
    } else if (this.#current.value !== ';') {
      this.error(this.#messages.comma)
    }
  }

  operlist() {
    if (this.isDone() || this.#current.value === '}') {// '}' - для проверки окончания тела
      return
    }

    if (['if', 'while'].includes(this.#current.value)) {
      this.next()
      this.condition()
      this.operlist()
    } else {
      this.next()
      this.assignment()
    }
  }

  assignment() {
    if (this.#current.value !== '=') {
      this.error(this.#messages.assignment)
    }

    this.next()
    this.expression()
  }

  expression() {
    while (this.#current.value !== ';') {
      // TODO Lab 6 expressions
      if (keywords.includes(this.#current.value)) {
        this.error()
      }

      this.next()
    }

    this.next()
    this.operlist()
  }

  condition() {
    if (this.#current.value !== '(') {
      this.error(this.#messages.conditionalExpressionStart)
    }

    this.next()
    this.conditionalExpression()

    if (this.#current.value !== ')') {
      this.error(this.#messages.conditionalExpressionEnd)
    }

    this.next()
    this.body()
  }

  body() {
    if (this.#current.value !== '{') {
      this.error(this.#messages.bodyStart)
    }

    this.next()
    this.operlist()

    if (this.#current.value !== '}') {
      this.error(this.#messages.bodyEnd)
    }

    this.next()

    if (this.#current.value === 'else') {
      this.next()
      this.body()
    }
  }

  conditionalExpression() {
    if (!this.isOperand()) {
      this.error(this.#messages.operand)
    }

    this.next()

    if (!comparison(this.#current.value)) {
      this.error(this.#messages.comparison)
    }

    this.next()

    if (!this.isOperand()) {
      this.error(this.#messages.operand)
    }

    this.next()
  }

  isOperand() {
    return identifiers.some(this.compareWithCurrent.bind(this)) || isNumber(this.#current.value)
  }
}

module.exports = {
  Parser
}
