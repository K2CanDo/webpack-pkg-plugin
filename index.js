// const mm = require('micromatch');
const {exec} = require('pkg')
const path = require('path')

class WebpackPkgPlugin {
  constructor ({targets}) {
    const isArray = (targets instanceof Array)
    if (!isArray) {
      console.log('"targets" option for WebpackPkgPlugin isn\'t specified. Using defaults.')
    }

    const arrayOfTargets = isArray ? targets : ['host']
    this.options = {
      targets: arrayOfTargets
    }
  }

  apply (compiler) {
    compiler.plugin('after-emit', async (compilation, callback) => {
      const {targets} = this.options
      const {outputPath} = compilation.compiler

      // NOTE: get only first file from compiled assets
      const IAssumeThatYouConcatenatedYourApp = Object.keys(compilation.assets)[0]
      const entry = path.join(outputPath, IAssumeThatYouConcatenatedYourApp)

      let pkged = {}
      try {
        pkged = await exec([
          entry,
          '--debug',
          '--targets', targets.join(',')
        ])
      } catch(e) {
        throw new Error('Pkg can\'t build executables, because:\n', e)
      }

      // Insert this list into the Webpack build as a new file asset:
      compilation.assets['filelist.md'] = {
        source: function () {
          return filelist
        }
      }

      callback()
    })
  }
}

module.exports.WebpackPkgPlugin = WebpackPkgPlugin