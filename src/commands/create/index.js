import co from 'co'
import BaseCommand from '../base'

export default class CreateCommand extends BaseCommand {
  static command = 'create'
  static alias = 'cr'
  static description = '创建 Zao 模板'

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