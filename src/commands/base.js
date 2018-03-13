export default class BaseCommand {
  constructor() {
    this.setup()
  }

  setup(env, cwd) {
    this.env = env = process.env
    this.cwd = cwd = process.cwd()
  }
}