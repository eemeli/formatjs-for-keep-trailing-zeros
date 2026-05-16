import {Decimal} from 'decimal.js'
import {ToPrimitive} from './262.js'

/**
 * https://tc39.es/ecma402/#sec-tointlmathematicalvalue
 * Converts input to a mathematical value, supporting BigInt
 */
export function ToIntlMathematicalValue(input: unknown): Decimal {
  // Handle BigInt directly before ToPrimitive, since ToPrimitive doesn't
  // handle bigint in its type signature (though the spec says it should return it as-is)
  if (typeof input === 'bigint') {
    return new Decimal(input.toString())
  }

  let primValue = ToPrimitive(input, 'number')

  // Handle other primitive types
  if (primValue === undefined) {
    return new Decimal(NaN)
  }
  if (primValue === true) {
    return new Decimal(1)
  }
  if (primValue === false) {
    return new Decimal(0)
  }
  if (primValue === null) {
    return new Decimal(0)
  }

  // Try to convert to Decimal (handles numbers and strings)
  try {
    let d = new Decimal(primValue as any)
    if (typeof primValue === 'string') {
      const numericLiteral = primValue.trim()
      const unsignedDecimalLiteral = numericLiteral.startsWith('-')
        ? numericLiteral.substring(1)
        : numericLiteral

      let stringDigitCount = 0
      let mvFractionDigitCount = 0
      const match = unsignedDecimalLiteral.match(
        /^([0-9]*)(?:\.([0-9]*))?(?:[eE](-?[0-9]+))?/
      )!
      if (match) {
        const intPart = match[1] ?? ''
        const fracPart = match[2] ?? ''
        const n = fracPart.length
        const e = Number(match[3] ?? 0)
        stringDigitCount =
          (intPart + fracPart).replace(/^0+/, '').length || 1 + n
        mvFractionDigitCount = Math.max(0, n - e)
      }

      const rounded = d.toNumber()
      if (!Number.isFinite(rounded) || rounded === 0) d = new Decimal(rounded)

      Object.assign(d, {
        __StringDigitCount: stringDigitCount,
        __MVFractionDigitCount: mvFractionDigitCount,
      })
    }
    return d
  } catch {
    return new Decimal(NaN)
  }
}
