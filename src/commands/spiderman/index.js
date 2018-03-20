import co from 'co'
import BaseCommand from '../base'
import parse5 from 'parse5'
import { Client } from '@ali/air-cli-sdk'
import jmc from '@ali/just-mobile-core'
import urllib from 'urllib'
import fs from 'fs'
import path from 'path'
const cwd = process.cwd()
import config from './config'
import htmlMinify from 'html-minifier'
const { Publish } = jmc
import gradient from 'gradient-string'
const coolGradient = gradient('red', 'green', 'blue')

const SNIPPETS_PATH = path.join(cwd, './patch-snippets')
const BUNDLE_FILE_PATH = path.join(cwd, config.assets.outdir, config.assets.file)

const BLACK_LIST = [
  'wing',
  'lofty',
  'air',
  'web-rax-framework'
]

const BLACK_LIST_REG = new RegExp(BLACK_LIST.join('|'))

const BLACK_LIST_FILTER = node => {
  const src = node.attrs && node.attrs[0] || {value: ''}
  return (node.nodeName === 'script' && !BLACK_LIST_REG.test(src.value)) || node.nodeName !== 'script'
}

const AIR_PAGE_LAMBDA = id => `https://air.1688.com/roc/${id}/index.html?__pageId__=${id}`
const AIR_BUNDLE_LAMBDA = id => `https://air.1688.com/roc/${id}/index.html?wh_ttid=native`

const filterMetaViewport = node => {
  return !(node.nodeName === 'meta' && node.attrs[0].value === 'viewport')
}

export default class PushCommand extends BaseCommand {
  static command = 'spiderman'
  static alias = 'sm'
  static description = 'm-spiderman 临时命令'

  init(command) {
    command
      .option('-r, --remote', '指定一个 Air 页面地址')
      .option('-p, --plugin', '指定编织插件')
  }

  getRemoteContent (url) {
    return new Promise((resolve, reject) => {
      urllib.request(url, (err, data, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(data.toString())
        }
      })
    })
  }

  parseHtml (html, parse = parse5.parse) {
    return Promise.resolve(parse(html))
  }

  loadSnippet (snippet) {
    const fileContent = fs.readFileSync(path.join(SNIPPETS_PATH, snippet + '.html'))
    return Promise.resolve(fileContent.toString())
  }

  parseSnippet (snippet, parse = parse5) {
    return Promise.resolve(parse.parseFragment(snippet))
  }
  
  getNodeFromDocument (document, nodeName) {
    const node = document.childNodes[1].childNodes.filter((node) => {
      return node.nodeName === nodeName
    })
    return Promise.resolve(node[0])
  }

  removeChildnodesFromNode (node, assertRemove) {
    const indexArray = []
    const newChildren = node.childNodes.filter(assertRemove)
    node.childNodes = newChildren
  }

  addNodesFromFragment (node, fragment) {
    const children = node.childNodes
    fragment.childNodes.forEach((script) => {
      children.push(script)
    })
  }

  setupPatchjsSnippet (s, path, version, file) {
    return s.replace(/@PATH/i, path)
      .replace(/@VERSION/i, version)
      .replace(/@FILE/i, file)
  }

  compressHtml (source) {
    const output = htmlMinify.minify(source, {
      minifyCSS: true,
      minifyJS: true,
      minifyURLs: true,
      removeComments: true,
      collapseWhitespace: true
    })

    return output
  }

  publishToAir (htmlContent) {
    const client = new Client()
    return client
    .publishPage([{
      config: {
        path: `/apps/alim/alipay-hysc/${config.container.name}.html`,
        productId: config.air.productId,
        publishType: config.env === 'production' ? 'release' : 'prepub',
        terminalType: 'phone'
      },
      page: {
        outputCharset: 'utf-8',
        templates: {
          'index.xtpl': `{{% ${htmlContent} %}}`
        },
        $page: {
          spm: [config.page.spmA, config.page.spmB],
          title: config.page.title
        },
        author: config.air.author
      }
    }])
  }

  printLogo () {
    console.log(coolGradient(
      `
      ███╗   ███╗      ███████╗██████╗ ██╗██████╗ ███████╗██████╗ 
      ████╗ ████║      ██╔════╝██╔══██╗██║██╔══██╗██╔════╝██╔══██╗
      ██╔████╔██║█████╗███████╗██████╔╝██║██║  ██║█████╗  ██████╔╝
      ██║╚██╔╝██║╚════╝╚════██║██╔═══╝ ██║██║  ██║██╔══╝  ██╔══██╗
      ██║ ╚═╝ ██║      ███████║██║     ██║██████╔╝███████╗██║  ██║
      ╚═╝     ╚═╝      ╚══════╝╚═╝     ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝
                                                                  
      `
    ))
  }

  pullBundlejs (bundlejs) {
    fs.writeFileSync(BUNDLE_FILE_PATH, bundlejs)
  }

  publishToCdn (b) {
    return Publish
    .pubAssets(config.env, {
      baseDir: cwd,
      buildDir: config.assets.outdir,
      group: config.assets.group,
      project: config.assets.project,
      version: config.assets.version,
      author: config.assets.author
    })
  }

  * do () {
    this.printLogo()
    const html = yield this.getRemoteContent(AIR_PAGE_LAMBDA(config.air.pageId))
    let bundlejs = yield this.getRemoteContent(AIR_BUNDLE_LAMBDA(config.air.pageId))
    const document = yield this.parseHtml(html)
    const getNodeFromRootDocument = (nodeName) => {
      return this.getNodeFromDocument(document, nodeName)
    }
    const headNode = yield getNodeFromRootDocument('head')
    const bodyNode = yield getNodeFromRootDocument('body')
    const patchjsLoadSnippet = yield this.loadSnippet('load-patchjs')
    const patchjsLoadSnippetFragment = yield this.parseSnippet(patchjsLoadSnippet)
    const patchjsStartSnippet = yield this.loadSnippet('start-patchjs')
    const patchjsStartSnippetFragment = yield this.parseSnippet(
      this.setupPatchjsSnippet(
        patchjsStartSnippet,
        config.patchjs.PATH,
        config.patchjs.VERSION,
        config.patchjs.FILE
      )
    )

    const fastclickSnippetFragment = yield this.parseSnippet(yield this.loadSnippet('fastclick'))
    const polyfillSnippetFragment = yield this.parseSnippet(yield this.loadSnippet('pollyfill'))
    const webRaxFrameworkSnippetFragment = yield this.parseSnippet(yield this.loadSnippet('web-rax-framework'))
    // const pageDataSnippetFragment = yield this.parseSnippet(yield this.loadSnippet('page-data'))
    const linkSnippetFragment = yield this.parseSnippet(yield this.loadSnippet('link'))
    const resetStyleFragment = yield this.parseSnippet(yield this.loadSnippet('reset-style'))
    const viewportFragment = yield this.parseSnippet(yield this.loadSnippet('viewport'))
    const loginFragment = yield this.parseSnippet(yield this.loadSnippet('login'))

    // remove
    this.removeChildnodesFromNode(headNode, BLACK_LIST_FILTER)
    this.removeChildnodesFromNode(headNode, filterMetaViewport)
    this.removeChildnodesFromNode(bodyNode, BLACK_LIST_FILTER)

    // add
    this.addNodesFromFragment(headNode, viewportFragment)
    this.addNodesFromFragment(headNode, resetStyleFragment)
    this.addNodesFromFragment(headNode, patchjsLoadSnippetFragment)
    this.addNodesFromFragment(headNode, loginFragment)
    this.addNodesFromFragment(headNode, linkSnippetFragment)
    this.addNodesFromFragment(headNode, webRaxFrameworkSnippetFragment)
    this.addNodesFromFragment(headNode, polyfillSnippetFragment)
    // this.addNodesFromFragment(headNode, pageDataSnippetFragment)
    this.addNodesFromFragment(headNode, fastclickSnippetFragment)

    // patchjs start
    this.addNodesFromFragment(bodyNode, patchjsStartSnippetFragment)

    // prerender
    // TODO: make it easy to use

    // link patch
    // this.addNodesFromFragment(bodyNode, linkSnippetFragment)

    // output document
    const outputDocument = this.compressHtml(parse5.serialize(document))

    // add some content to bundlejs
    const zeptoBundlejs = yield this.getRemoteContent(config.umdjs.zepto)
    const chestAppBundlejs = yield this.getRemoteContent(config.umdjs.chest)
    
    bundlejs = zeptoBundlejs + chestAppBundlejs + bundlejs

    // pull bundlejs
    this.pullBundlejs(bundlejs)
    
    // publish to air
    const airRet = yield this.publishToAir(outputDocument)

    if(airRet.message === 'success') {
      console.log(`页面发布成功: ${airRet.data}`)
    }

    // publish bundlejs to cdn
    yield this.publishToCdn(bundlejs)
    
    // exit
    process.exit(0)
  }

  action () {
    co(this.do.bind(this))
    .catch((err) => {
      // error handler
      console.log(err)
    })
  }
}
