import cli from 'commander'
import fs from 'fs'
import path from 'path'
import { self } from './helper'
import debugFactory from 'debug'

const debug = debugFactory('zao:cli')
const COMMANDS_DIR = path.join(__dirname, 'commands')
const COMMANDS_QUEUE = []

debug('commands entry path: %s', COMMANDS_DIR)

const injectCommandFromClass = (cliEngine, CommandClass) => {
  const { command, alias = '', description} = CommandClass
  let instance = new CommandClass()

  debug('DO_INJECT:: command: %s | description: %s', command, description)
  
  // for debugging
  if (COMMANDS_QUEUE.includes(command))
    throw new Error(
      `[${command}] has already been injected, `
      + `please check the \`command\` static property of ${CommandClass.name}.`
    )

  // define command
  let commandInstance = cliEngine.command(command)
  COMMANDS_QUEUE.push(command)

  // pass `commandInstance` to command instance
  // for example: initialize command options
  instance.init && instance.init(commandInstance)
  
  // alias & description
  commandInstance
    .alias(alias)
    .description(description)

  // bind action to command
  commandInstance.action(instance.action.bind(instance))
}

export default () => {
  // set version
  cli.version(self.packageVersion)

  // inject commands
  const modules = fs.readdirSync(COMMANDS_DIR)
    // FXIME
    // why not detect file exits ?
    .filter(i => !/base\.js/.test(i))
    .map((moduleEntry) => {
      let modulePath = path.join(COMMANDS_DIR, moduleEntry)
      debug('command module loaded: %s', modulePath)
      return require(modulePath).default
    })
    , mods = modules.slice()

  while(module = mods.pop()) {
    try {
      injectCommandFromClass(cli, module)
    } catch(err) {
      debug(`inject process fail: ${err}`)
      break
    }
  }
  
  if (COMMANDS_QUEUE.length === modules.length)
    debug('all commands have been inject.')
  
  // start parse
  cli.parse(process.argv)
}
