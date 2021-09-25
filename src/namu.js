import 'mdn-polyfills/Element.prototype.closest'
import 'mdn-polyfills/Node.prototype.after'
import 'mdn-polyfills/Node.prototype.append'
import 'mdn-polyfills/Node.prototype.before'
import 'mdn-polyfills/CustomEvent'

import history from './history'

import './namu.scss'

const NAMU_SIZE = 24

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

const _attachKnob = ul => {
  const knob = document.createElement('button')
  knob.classList.add('namu__knob')
  ul.after(knob)
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
  source.dispatchEvent(
      new CustomEvent('namu:drop', {
        bubbles: true,
        source
      })
  )

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
  let el = from

  do {
    if (!el || el === to) {
      break
    }

    el.dispatchEvent(
        new CustomEvent('namu:move', {
          bubbles: true,
          el
        })
    )
  }
  while ((el = el.nextElementSibling))
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

const _clickKnob = e => {
  const knob = e.target
  if (knob.classList.contains('namu__knob')) {
    const ul = knob.previousElementSibling

    if (knob.classList.toggle('namu__knob--purse')) {
      ul.setAttribute('hidden', '')
    } else {
      ul.removeAttribute('hidden')
    }
  }
}

const add = li => {
  li.setAttribute('draggable', 'true')
  li.classList.add('namu__leaf')

  let ul = li.querySelector('ul')
  if (!ul) {
    ul = document.createElement('ul')
    li.append(ul)
  }

  ul.classList.add('namu__branch')
  _attachKnob(ul)
}

export const namu = root => {
  if (!root) {
    return
  }

  root.classList.add('namu')

  root.addEventListener('dragstart', _dragStart)
  root.addEventListener('dragover', _dragOver)
  root.addEventListener('dragenter', e => e.preventDefault())
  root.addEventListener('drop', _drop)
  root.addEventListener('dragend', _dragEnd)
  root.addEventListener('click', _clickKnob)

  Array.prototype.forEach.call(root.querySelectorAll('li'), add)

  return {
    add
  }
}
