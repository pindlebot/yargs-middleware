#!/bin/env/bash node

const createMiddleware = require('../')
const yargs = require('yargs')

const middleware = createMiddleware('yconfig')

yargs.option('key', { type: 'string' })
  .middleware(middleware)
  .command('$0', '', () => {}, (argv) => {
    console.log(process.env)
  })
  .argv