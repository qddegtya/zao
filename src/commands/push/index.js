import BaseCommand from '../base'

export default class PushCommand extends BaseCommand {
  static command = 'push'
  static alias = 'pu'
  static description = '推送 Zao 模板'

  init(command) {
    command
      .option('-r, --remote', '指定一个远程 Zao Repo 进行初始化')
  }

  * do () {
    console.log(this.context)
  }
}
