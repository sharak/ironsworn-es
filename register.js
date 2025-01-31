const MODULE_ID = 'ironsworn-es'

Hooks.on('init', () => {
  game.settings.register(MODULE_ID, 'autoRegisterBabel', {
    name: 'Automatically activate translation via Babele',
    hint: 'Automatically implements Babele translations without needing to point to the directory containing the translations.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
    onChange: value => {
      if (value) {
        autoRegisterBabel()
      }

      window.location.reload()
    },
  })

  if (game.settings.get(MODULE_ID, 'autoRegisterBabel')) {
    autoRegisterBabel()
  }
})

function autoRegisterBabel () {
  if (typeof Babele !== 'undefined') {
    const babele = game.babele
    babele.register({
      module: MODULE_ID,
      lang: 'es',
      dir: 'compendium/es',
    })
    babele.registerConverters({
      arrayConverter: (value, translation) =>
        value.map((original, index) => foundry.utils.mergeObject(original, translation[index], { inplace: false })),
      sfMoveOptionsConverter: (...args) => {
        const obj = args[0]
        const translation = args[4]
        if (translation['options']) {
          for (let i = 0; i < translation['options'].length; i++) {
            obj[i].Text = translation['options'][i]
          }
        }
        return obj
      },
      sfTruthsConverter: (value, translations, data, tc, translation) => {
        const { pages } = babele.converters
        const tPages = pages(value, translations)
        for (let page of tPages) {
          tc.translations[page.name] = translation.pages[page.name]
          page = tc.translate({
            ...page,
            translated: false
          })
        }

        return tPages
      },
      sfTruthsSubtable: (...args) => {
        const value = args[0]
        const translation = args[4]
        if (translation['subtableResults']) {
          for (let i = 0; i < translation['subtableResults'].length; i++) {
            value[i].Result = translation['subtableResults'][i]
          }
        }

        return value
      }
    })
  }
}