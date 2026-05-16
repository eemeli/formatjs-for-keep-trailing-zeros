import {it, expect} from 'vitest'
import '@formatjs/intl-pluralrules/polyfill.js'
import '@formatjs/intl-pluralrules/locale-data/en'
import * as en from './locale-data/en.json'
import {NumberFormat} from '../src/core'
NumberFormat.__addLocaleData(en as any)

const assert = {
  sameValue: (a: unknown, b: unknown) =>
    it(`${a} is ${b}`, () => {
      expect(a).toBe(b)
    }),
}

const nf = new NumberFormat('en-US', {maximumFractionDigits: 20})

// The value 100,000 should only be interpreted as infinity if the input is the
// string "Infinity".
assert.sameValue(nf.format('100000'), '100,000')
// The value -100,000 should only be interpreted as negative infinity if the
// input is the string "-Infinity".
assert.sameValue(nf.format('-100000'), '-100,000')

assert.sameValue(nf.format('1.0000000000000001'), '1.0000000000000001')
assert.sameValue(nf.format('-1.0000000000000001'), '-1.0000000000000001')
assert.sameValue(nf.format('987654321987654321'), '987,654,321,987,654,321')
assert.sameValue(nf.format('-987654321987654321'), '-987,654,321,987,654,321')

assert.sameValue(nf.format('0'), '0')
assert.sameValue(nf.format('1'), '1')
assert.sameValue(nf.format('0.0'), '0.0')
assert.sameValue(nf.format('1.0'), '1.0')
assert.sameValue(nf.format('10.0'), '10.0')
assert.sameValue(nf.format('0.10'), '0.10')
assert.sameValue(nf.format('0.010'), '0.010')
assert.sameValue(nf.format('0.5000'), '0.5000')
assert.sameValue(nf.format('.10'), '0.10')
assert.sameValue(nf.format('.0'), '0.0')
assert.sameValue(nf.format('00.0'), '0.0')
assert.sameValue(nf.format('-0.00'), '-0.00')
assert.sameValue(nf.format('-.00'), '-0.00')
assert.sameValue(nf.format('3.100'), '3.100')
assert.sameValue(nf.format('6.000000'), '6.000000')
assert.sameValue(nf.format('1.230e+1'), '12.30')
assert.sameValue(nf.format('1.230e+0'), '1.230')
assert.sameValue(nf.format('1.230e-1'), '0.1230')
assert.sameValue(nf.format('1.230e-2'), '0.01230')
assert.sameValue(nf.format('12.30e-1'), '1.230')
assert.sameValue(nf.format('12.30e-2'), '0.1230')
assert.sameValue(nf.format('12.30e-3'), '0.01230')
assert.sameValue(nf.format('1.2345e-21'), '0.00000000000000000000')
assert.sameValue(nf.format('1.2345e-100'), '0.00000000000000000000')
assert.sameValue(nf.format('1.2345e-1000'), '0.00000000000000000000')

// Default maximumfractionDigits is 3
const nf2 = new NumberFormat('en-US', {minimumFractionDigits: 1})

assert.sameValue(nf2.format('1'), '1.0')
assert.sameValue(nf2.format('1.00'), '1.00')
assert.sameValue(nf2.format('1.000000'), '1.000')
assert.sameValue(nf2.format('0.999'), '0.999')
assert.sameValue(nf2.format('0.9999'), '1.000')

const nf3 = new NumberFormat('en-US', {
  minimumSignificantDigits: 2,
  maximumSignificantDigits: 4,
})

assert.sameValue(nf3.format('1'), '1.0')
assert.sameValue(nf3.format('1.0'), '1.0')
assert.sameValue(nf3.format('1.00'), '1.00')
assert.sameValue(nf3.format('0.00'), '0.00')
assert.sameValue(nf3.format('.00'), '0.00')
assert.sameValue(nf3.format('0.000000'), '0.000')
assert.sameValue(nf3.format('1.000000'), '1.000')
assert.sameValue(nf3.format('1.99999'), '2.000')
assert.sameValue(nf3.format('1.2'), '1.2')
assert.sameValue(nf3.format('0.12'), '0.12')
assert.sameValue(nf3.format('0.012'), '0.012')
assert.sameValue(nf3.format('1.2345e-21'), '0.000000000000000000001235')
assert.sameValue(nf3.format('1.2345e-1000'), '0.000')

const nf4 = new NumberFormat('en-US', {
  minimumSignificantDigits: 2,
  maximumSignificantDigits: 4,
  // @ts-ignore -- Not yet supported by TS Intl types
  trailingZeroDisplay: 'stripToMinimum',
})

assert.sameValue(nf4.format('1'), '1.0')
assert.sameValue(nf4.format('1.0'), '1.0')
assert.sameValue(nf4.format('1.00'), '1.0')
assert.sameValue(nf4.format('0.00'), '0.0')
assert.sameValue(nf4.format('.00'), '0.0')
assert.sameValue(nf4.format('0.000000'), '0.0')
assert.sameValue(nf4.format('1.000000'), '1.0')
assert.sameValue(nf4.format('1.99999'), '2.0')

const pf = new NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 10,
})

assert.sameValue(pf.format('1.0'), '100%')
assert.sameValue(pf.format('1.00'), '100%')
assert.sameValue(pf.format('0.50'), '50%')
assert.sameValue(pf.format('.5000'), '50.00%')

const sf = new NumberFormat('en-US', {notation: 'scientific'})

assert.sameValue(sf.format('0.1'), '1E-1')
assert.sameValue(sf.format('0.01'), '1E-2')
assert.sameValue(sf.format('0.01200'), '1.200E-2')
assert.sameValue(sf.format('120.0'), '1.200E2')
assert.sameValue(sf.format('1.200e-3'), '1.200E-3')
assert.sameValue(sf.format('12.00e-3'), '1.200E-2')
assert.sameValue(sf.format('.1200e-3'), '1.200E-4')

const spf = new NumberFormat('en-US', {
  style: 'percent',
  notation: 'scientific',
  maximumFractionDigits: 10,
})

assert.sameValue(spf.format('0.0'), '0.0E0%')
assert.sameValue(spf.format('1.0'), '1.0E2%')
assert.sameValue(spf.format('1.00'), '1.00E2%')
assert.sameValue(spf.format('0.50'), '5.0E1%')
assert.sameValue(spf.format('0.5000'), '5.000E1%')
