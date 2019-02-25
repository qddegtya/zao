import co from 'co'

export default class BaseCommand {
  constructor() {
    this.setup()
  }

  setup() {
    this.context = {
      env: process.env,
      cwd: process.cwd()
    }
  }

  action () {
    co(this.do.bind(this))
    .catch((err) => {
      // global error handler
      throw err
    })
  }
}
