import {Decimal} from 'decimal.js'
import {
  type RawNumberFormatResult,
  type UnsignedRoundingModeType,
} from '../types/number.js'
import {repeat} from '../utils.js'
import {ApplyUnsignedRoundingMode} from './ApplyUnsignedRoundingMode.js'
import {getPowerOf10} from './decimal-cache.js'

//IMPL: Setting Decimal configuration
Decimal.set({
  toExpPos: 100,
})

//IMPL: Helper function to calculate raw fixed value
function ToRawFixedFn(n: Decimal, f: number) {
  return n.times(getPowerOf10(-f))
}

//IMPL: Helper function to find n1 and r1
function findN1R1(x: Decimal, f: number, roundingIncrement: number) {
  const nx = x.times(getPowerOf10(f)).floor()
  const n1 = nx.div(roundingIncrement).floor().times(roundingIncrement)
  const r1 = ToRawFixedFn(n1, f)
  return {
    n1,
    r1,
  }
}

//IMPL: Helper function to find n2 and r2
function findN2R2(x: Decimal, f: number, roundingIncrement: number) {
  const nx = x.times(getPowerOf10(f)).ceil()
  const n2 = nx.div(roundingIncrement).ceil().times(roundingIncrement)
  const r2 = ToRawFixedFn(n2, f)
  return {
    n2,
    r2,
  }
}

/**
 * https://tc39.es/ecma402/#sec-torawfixed
 * @param x a finite non-negative Number or BigInt
 * @param stringDigitCount a non-negative integer
 * @param mvFractionDigitCount a non-negative integer
 * @param minFraction an integer between 0 and 20
 * @param maxFraction an integer between 0 and 20
 */
export function ToRawFixed(
  x: Decimal,
  stringDigitCount: number,
  mvFractionDigitCount: number,
  minFraction: number,
  maxFraction: number,
  roundingIncrement: number,
  unsignedRoundingMode: UnsignedRoundingModeType
): RawNumberFormatResult {
  // 1. Let f be maxFraction.
  const f = maxFraction

  // 2. Let n1 and r1 be the results of performing the maximized rounding of x to f fraction digits.
  const {n1, r1} = findN1R1(x, f, roundingIncrement)

  // 3. Let n2 and r2 be the results of performing the minimized rounding of x to f fraction digits.
  const {n2, r2} = findN2R2(x, f, roundingIncrement)

  // 4. Let r be ApplyUnsignedRoundingMode(x, r1, r2, unsignedRoundingMode).
  const r = ApplyUnsignedRoundingMode(x, r1, r2, unsignedRoundingMode)

  let n: Decimal, xFinal: Decimal
  let m: string

  // 5. If r is equal to r1, then
  if (r.eq(r1)) {
    // a. Let n be n1.
    n = n1
    // b. Let xFinal be r1.
    xFinal = r1
  } else {
    // 6. Else,
    // a. Let n be n2.
    n = n2
    // b. Let xFinal be r2.
    xFinal = r2
  }

  // 7. If n is 0, let m be "0".
  if (n.isZero()) {
    m = '0'
  } else {
    // 8. Else, let m be the String representation of n.
    m = n.toString()
  }

  let int

  // 9. If f is not 0, then
  if (f !== 0) {
    // a. Let k be the length of m.
    let k = m.length
    let zn = 0

    // b. If k < f, then
    if (k <= f) {
      zn = f - k + 1
      // i. Let z be the String value consisting of f + 1 - k occurrences of the character "0".
      const z = repeat('0', zn)
      // ii. Set m to the string-concatenation of z and m.
      m = z + m
      // iii. Set k to f + 1.
      k = f + 1
    }

    // c. Let a be the substring of m from 0 to k - f.
    const a = m.slice(0, k - f)
    // d. Let b be the substring of m from k - f to k.
    let b = m.slice(m.length - f)
    // e. Let int be the length of a.
    int = a.length

    let sfc
    if (/^0+$/.test(m)) sfc = mvFractionDigitCount
    else if (n.isZero()) sfc = stringDigitCount - int
    else sfc = stringDigitCount - int + zn

    // f. Let cut be maxFraction - max(stringDigitCount - int, minFraction).
    let cut = maxFraction - Math.max(sfc, minFraction)
    // g. Repeat, while cut > 0 and the last code unit of b is 0x0030 (DIGIT ZERO),
    while (cut > 0 && b[b.length - 1] === '0') {
      // i. Remove the last code unit from b.
      b = b.slice(0, b.length - 1)
      // ii. Set cut to cut - 1.
      cut--
    }
    // h. If b is the empty String, set m to a.
    if (b === '') {
      m = a
    } else {
      // i. Else, set m to the string-concatenation of a, ".", and b.
      m = a + '.' + b
    }
  } else {
    // 10. Else, let int be the length of m.
    int = m.length
  }

  // 12. Return the Record { [[FormattedString]]: m, [[RoundedNumber]]: xFinal, [[IntegerDigitsCount]]: int, [[RoundingMagnitude]]: -f }.
  return {
    formattedString: m,
    roundedNumber: xFinal,
    integerDigitsCount: int,
    roundingMagnitude: -f,
  }
}
