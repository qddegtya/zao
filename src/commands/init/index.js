import co from 'co'
import BaseCommand from '../base'

export default class InitCommand extends BaseCommand {
  static command = 'init'
  static alias = 'i'
  static description = '初始化 Zao 模板'

  init(command) {
    command
      .option('-r, --remote', '指定一个远程 Zao Repo 进行初始化')
  }

  * do () {
    console.log(this.cwd)
  }

  action () {
    co(this.do.bind(this))
    .catch((err) => {
      // error handler
    })
  }
}