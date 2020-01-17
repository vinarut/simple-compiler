const fs = require('fs')
const path = require('path')
const { isVariable, isNumber, comparison } = require('./utils')

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
  #outputArray = []
  #operationStack = []
  #tetrads = []
  #assignmentVariable

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

  addToOutputArray(value = '') {
    this.#outputArray.push(value || this.#current.value)
  }

  addToOperationStack() {
    this.#operationStack.push(this.#current.value)
  }

  popFromOperationStack() {
    return this.#operationStack.pop()
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
    if (this.isDone() || this.#current.value === '}') {
      // '}' - для проверки окончания тела
      return
    }

    if (['if', 'while'].includes(this.#current.value)) {
      this.next()
      this.condition()
      this.operlist()
    } else {
      this.#assignmentVariable = this.#current.value
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
    this.#outputArray = []

    while (this.#current.value !== ';') {
      if (this.isDone()) {
        this.error(this.#messages.semi)
      }

      if (keywords.includes(this.#current.value)) {
        this.error()
      }

      this.reversePolish()
      this.next()
    }

    while (this.#operationStack.length) {
      this.addToOutputArray(this.popFromOperationStack())
    }

    this.tetradsFormation()

    this.next()
    this.operlist()
  }

  reversePolish() {
    if (this.#current.value === '(') {
      this.addToOperationStack()
      return
    }

    if (identifiers.includes(this.#current.value) || isNumber(this.#current.value)) {
      this.addToOutputArray()
      return
    }

    if (this.#current.value === ')') {
      let lastOperation = this.popFromOperationStack()

      while (lastOperation !== '(') {
        this.addToOutputArray(lastOperation)
        lastOperation = this.popFromOperationStack()
      }

      return
    }

    if (this.#operationStack.length) {
      const lastOperation = this.#operationStack[this.#operationStack.length - 1]
      const lastOperationPriority = this.getPriority(lastOperation)
      const currentOperationPriority = this.getPriority()

      if (lastOperationPriority >= currentOperationPriority) {
        this.addToOutputArray(this.popFromOperationStack())
      }
    }

    this.addToOperationStack()
  }

  getPriority(operation = '') {
    const level = {
      '*': 3,
      '/': 3,
      '+': 2,
      '-': 2,
      '(': 1
    }

    return level[operation || this.#current.value]
  }

  tetradsFormation() {
    const stack = []
    const tetrads = []

    for (const element of this.#outputArray) {
      if (isVariable(element) || isNumber(element)) {
        stack.push(element)
        continue
      }

      const secondOperand = stack.pop()
      const firstOperand = stack.pop()
      const variable = `var${tetrads.length}`

      tetrads.push([element, firstOperand, secondOperand, variable])
      stack.push(variable)
    }

    tetrads.push(['=', stack.pop(), 0, this.#assignmentVariable])

    this.#tetrads.push(tetrads)
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
