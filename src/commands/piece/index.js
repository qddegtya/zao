import BaseCommand from '../base'

export default class PieceCommand extends BaseCommand {
  static command = 'piece'
  static alias = 'p'
  static description = '初始化 Zao 片段'

  init(command) {
    command
      .option('-r, --remote', '指定一个远程 Zao Repo 进行初始化')
  }

  * do () {
    console.log(this.context)
  }
}
