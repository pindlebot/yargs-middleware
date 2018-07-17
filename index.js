const fs = require('fs')
const path = require('path')
const { serialize, deserialize } = require('kvp')
const win = process.platform === 'win32'
const home = win
  ? process.env.USERPROFILE
  : process.env.HOME
  
const isUppercase = char =>
  char.charCodeAt(0) >= 65 && char.charCodeAt(0) <= 90

const simpleSplit = (chars) => {
  let str = ''
  let out = []
  let index = 0

  const put = value => {
    out.push(value)
    str = ''
  }

  while (index < chars.length) {
    let char = chars[index]
    let next = chars[index + 1] || ''
    str += char.toUpperCase()
    index++
    if (isUppercase(next)) {
      put(str)
      continue
    }
    if (index === chars.length) {
      put(str)
    }
  }

  return out
}

const snakeCase = (string) => {
  let out = simpleSplit(string.split(''))
  return out.join('_')
}

const normalize = (key = 'yconfig', options = {}) => {
  if (key.endsWith('.json')) {
    
  }
  if (!options.path) {
    options.path = path.join(home, `.${key}`)
  }

  options.path = path.isAbsolute(options.path)
    ? options.path
    : path.join(home, options.path)
  
  return { key, options }
}

module.exports = (...params) => {
  let { key, options } = normalize(...params)

  const load = (argv = {}) => {
    let config = {}
    try {
      config = fs.readFileSync(options.path, { encoding: 'utf8' })
    } catch (err) {}
    argv[key] = typeof config === 'string' ? deserialize(config) : {}
  }

  const save = (argv = {}) => {
    let omit = [key, '_', '$0'].concat(options.omit || [])
    let props = Object.keys(argv)
      .filter(k => !omit.includes(k))
  
    let isStale = false
  
    while (props.length) {
      let prop = props.shift()
      if (argv[prop] && argv[prop] !== (argv[key] || {})[prop]) {
        if (!isStale) {
          isStale = true
        }
        argv[key][prop] = argv[prop]
      }
    }
    for (let prop in argv[key]) {
      let type = typeof argv[key][prop]
      if (['string', 'boolean', 'number'].includes(type)) {
        process.env[snakeCase(prop)] = argv[key][prop]
      }
    }
    if (isStale) {
      fs.writeFileSync(options.path, serialize(argv[key]))
    }
  }
  return [
    load,
    save
  ]
}