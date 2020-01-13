const comparisonSign = ['==', '!=', '>', '<', '>=', '<=']

const isNumber = value => /^[\d]+$/.test(value) && isFinite(value)

const isVariable = literal => /^[a-zA-Z_$]+\w*/.test(literal)

const comparison = sign => comparisonSign.includes(sign)

const getComparisonSignInStr = str => comparisonSign.find(sign => str.includes(sign))

module.exports = {
  isNumber,
  isVariable,
  comparison,
  getComparisonSignInStr
}
