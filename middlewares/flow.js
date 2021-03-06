'use strict'

module.exports = function flow (elem, state, next) {
  if (!(elem instanceof Element)) {
    return next()
  }
  elem.$require('content', 'attributes')
  elem.$using('flow')

  if (hasIf(elem) && hasRepeat(elem)) {
    throw new Error('cant use nx-if and nx-repeat on the same node')
  } else if (hasIf(elem) || hasRepeat(elem)) {
    elem.$extractContent()
  }

  if (hasIf(elem)) {
    let showing = false
    elem.$attribute('nx-if', (show) => {
      if (show && !showing) {
        elem.$insertContent()
        showing = true
      } else if (!show && showing) {
        elem.$removeContent()
        showing = false
      }
    })
  }

  if (hasRepeat(elem)) {
    const repeatValue = elem.getAttribute('nx-repeat-value') || '$value'
    const repeatIndex = elem.getAttribute('nx-repeat-index') || '$index'

    const prevArray = []
    elem.$attribute('nx-repeat', (array) => {
      if (!Array.isArray(array)) {
        return
      }

      let viewIndex = 0
      for (let i = 0; i < Math.max(array.length, prevArray.length); i++) {
        if (prevArray[i] !== array[i]) {
          if (array[i] === undefined) {
            elem.$removeContent(viewIndex)
            viewIndex--
          } else if (prevArray[i] === undefined) {
            elem.$insertContent(viewIndex, {[repeatValue]: array[viewIndex], [repeatIndex]: viewIndex})
          } else {
            elem.$replaceContent(viewIndex, {[repeatValue]: array[viewIndex], [repeatIndex]: viewIndex})
          }
          prevArray[i] = array[i]
        }
        viewIndex++
      }
    })
  }

  return next()
}

function hasIf (elem) {
  return (elem.hasAttribute('$nx-if') || elem.hasAttribute('@nx-if'))
}

function hasRepeat (elem) {
  return (elem.hasAttribute('$nx-repeat') || elem.hasAttribute('@nx-repeat'))
}
