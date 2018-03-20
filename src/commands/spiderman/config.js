const ENV = process.env.ENV || 'daily'
const GROUP = 'alim'
const PROJECT = 'alipay-hysc'
const VERSION = '3.0.8'
const FILE = 'index.js'
const AUTHOR = 112754
const OUTDIR = 'bundlejs'

const config = {
  patchjs: {
    PATH: `//${ENV === 'production' ? 'g.alicdn.com' : 'g-assets.daily.taobao.net'}/${GROUP}/${PROJECT}/`,
    VERSION: VERSION,
    FILE: FILE
  },
  air: {
    pageId: 6370,
    productId: 1970,
    author: AUTHOR
  },
  env: ENV,
  assets: {
    group: GROUP,
    project: PROJECT,
    version: VERSION,
    file: FILE,
    author: AUTHOR,
    outdir: OUTDIR
  },
  container: {
    name: 'ap'
  },
  umdjs: {
    zepto: 'https://cdn.bootcss.com/zepto/1.2.0/zepto.min.js',
    chest: 'https://astyle.alicdn.com/pkg/@alife/mlofty-h5-chest/1.1.5/index.js'
  },
  // FIXME
  // 从页面上自动爬取
  page:{
    spmA: 'a262eq',
    spmB: '11280316',
    title: '货源市场 328 支付宝专项'
  }
}

export default config
