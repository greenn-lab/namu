import 'mdn-polyfills/Element.prototype.closest'
import 'mdn-polyfills/Node.prototype.after'
import 'mdn-polyfills/Node.prototype.append'
import 'mdn-polyfills/Node.prototype.before'
import 'mdn-polyfills/CustomEvent'

import history from './history'

import './namu.scss'

const NAMU_SIZE = parseInt(window.getComputedStyle(document.body).fontSize)

const BEM_PREFIX = 'namu__'

let source

// --------------------------------------------------
// functions
// --------------------------------------------------
const _outOfArea = target => !target || !target.closest('.namu')

const _canBeChild = (mouseX, target) =>
    target.previousElementSibling && mouseX > NAMU_SIZE * 2
const _becomeChildTo = parent =>
    parent && parent.querySelector('ul').append(source)

const _becomeBrotherTo = (brother, mouseY) => {
  if (source.contains(brother)) {
    return
  }

  if (mouseY < NAMU_SIZE / 4) {
    brother.before(source)
  }
  if (mouseY > NAMU_SIZE - NAMU_SIZE / 4) {
    brother.after(source)
  }
}

const _canBeParent = mouseX =>
    mouseX < -NAMU_SIZE / 2 && !_outOfArea(source.parentElement?.parentElement)
const _becomeParentTo = target => {
  _becomeBrotherTo(target, 999)
}

const _freezing = (target) => {
  target.style.opacity = '.1'
  source.freeze = target
}

const _melting = () => {
  if (source.freeze) {
    source.freeze.style.opacity = ''
    source.freeze = null
  }
}

// --------------------------------------------------
// events
// --------------------------------------------------
const _dragStart = e => {
  source = e.target
  source.completed = false
  source.freeze = null
  source.aim = e.pageX - source.getBoundingClientRect().x
  source.seat = _getSeatNumber(source)
  source.family = {
    next: source.nextElementSibling,
    prev: source.previousElementSibling,
    parent: source.parentElement
  }

  source.classList.add('namu--dragging')
}

const _dragOver = e => {
  e.preventDefault()

  const target = e.target.closest('li')

  if (_outOfArea(target) || source.freeze?.contains(target)) {
    return
  }

  _melting()

  if (source === target) {
    const mouseX = e.pageX - source.getBoundingClientRect().x - source.aim

    if (_canBeChild(mouseX, target)) {
      _becomeChildTo(source.previousElementSibling)
    } else if (_canBeParent(mouseX)) {
      target.parentElement && _freezing(target.parentElement)
      _becomeParentTo(source.parentElement.parentElement)
    }
  } else {
    _becomeBrotherTo(target, e.offsetY)
  }
}

const _drop = () => {
  if (source.parentElement === source.family.parent &&
      source.previousElementSibling === source.family.prev &&
      source.nextElementSibling === source.family.next) {
    return
  }

  source.completed = true

  _dispatch('fall', source)

  if (source.parentElement !== source.family.parent) {
    _eventShoveUp(source.family.next)
    _eventShoveUp(source.nextElementSibling)
  } else {
    const seat = _getSeatNumber(source)

    if (seat < source.seat) {
      _eventShoveUp(source.nextElementSibling, source.family.next)
    } else if (seat > source.seat) {
      _eventShoveUp(source.family.next, source)
    }
  }

  history(
      {source, ...source.family},
      {
        source,
        parent: source.parentElement,
        prev: source.previousElementSibling,
        next: source.nextElementSibling
      }
  )
}

const _dragEnd = () => {
  if (!source.completed) {
    if (source.family.next) {
      source.family.next.before(source)
    } else if (source.family.prev) {
      source.family.prev.after(source)
    } else if (source.family.parent) {
      source.family.parent.append(source)
    }
  }

  source.classList.remove('namu--dragging')

  _melting()
}

const _eventShoveUp = (from, to) => {
  let target = from

  do {
    if (!target || target === to) {
      break
    }

    _dispatch('shove', target)
  }
  while ((target = target.nextElementSibling))
}

const _getSeatNumber = el => {
  const all = el.parentElement.children
  for (let i = 0; i < all.length; i++) {
    if (all[i] === el) {
      return i
    }
  }

  return -1
}

const _click = e => {
  const target = e.target

  if (target.classList.contains(`${BEM_PREFIX}knob`)) {
    _clickKnob(target)
  } else {
    _dispatch('sway', target.closest('li'))
  }
}

const _clickKnob = knob => {
  const ul = knob.previousElementSibling
  const crush = knob.classList.toggle(`${BEM_PREFIX}knob--crush`)

  if (crush) {
    ul.setAttribute('hidden', '')
  } else {
    ul.removeAttribute('hidden')
  }

  _dispatch('crush', knob, {crush})
}

const grow = (parent, data) => {
  const a = document.createElement('a')
  a.textContent = data.name

  const ul = document.createElement('ul')
  ul.classList.add(`${BEM_PREFIX}fork`)

  data.children?.forEach(i => grow(ul, i))

  const knob = document.createElement('button')
  knob.classList.add(`${BEM_PREFIX}knob`)

  const li = document.createElement('li')
  li.classList.add(`${BEM_PREFIX}branch`)
  li.setAttribute('draggable', 'true')
  li.append(a, ul, knob)

  parent.append(li)
}

const _dispatch = (eventName, el, detail) => {
  el.dispatchEvent(
      new CustomEvent(`namu:${eventName}`, {
        bubbles: true,
        detail: {
          target: el,
          ...detail
        }
      })
  )
}

export const namu = {
  dispatch: _dispatch,
  plant(data) {
    return {
      on(element) {
        if (!element || !data) {
          throw new Error('Not able to start.')
        }

        element.classList.add('namu')

        Array.isArray(data)
            ? data.forEach(i => grow(element, i))
            : grow(element, data)

        element.addEventListener('dragstart', _dragStart)
        element.addEventListener('dragover', _dragOver)
        element.addEventListener('dragenter', e => e.preventDefault())
        element.addEventListener('drop', _drop)
        element.addEventListener('dragend', _dragEnd)
        element.addEventListener('click', _click)

        _dispatch('grown', element)

        return {
          grow
        }
      }
    }
  }
}
