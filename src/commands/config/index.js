import co from 'co'
import BaseCommand from '../base'

export default class ConfigCommand extends BaseCommand {
  static command = 'config'
  static alias = 'cf'
  static description = '初始化 Zao 配置'

  init(command) {
    
  }

  * do () {
    console.log(this.env)
  }

  action () {
    co(this.do.bind(this))
    .catch((err) => {
      // error handler
    })
  }
}