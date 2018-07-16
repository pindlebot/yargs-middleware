const fs = require('fs')
const path = require('path')
const { serialize, deserialize } = require('kvp')
const win = process.platform === 'win32'
const home = win
  ? process.env.USERPROFILE
  : process.env.HOME
  
const normalize = (key = 'yconfig', options = {}) => {
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
      config = fs.readFileSync(options.path)
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
    console.log({ argv, options, key })
    if (isStale) {
      fs.writeFileSync(options.path, serialize(argv[key]))
    }
  }
  return [
    load,
    save
  ]
}