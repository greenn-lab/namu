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

const _canBeParent = mouseX => mouseX < -NAMU_SIZE / 2
    && !_outOfArea(source.parentElement?.parentElement)
const _becomeParentTo = target => {
  _becomeBrotherTo(target, 999)
}

const _freezing = (target) => {
  if (target) {
    target.style.opacity = '.1'
    source.freeze = target
  } else if (source.freeze) {
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
  source.aim = e.offsetX
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

  _freezing()

  const mouseX = e.offsetX - source.aim
  const mouseY = e.offsetY

  if (source === target) {
    if (_canBeChild(mouseX, target)) {
      _becomeChildTo(source.previousElementSibling)
    } else if (_canBeParent(mouseX)) {
      _freezing(target.parentElement)
      _becomeParentTo(source.parentElement.parentElement)
    }
  } else {
    _becomeBrotherTo(target, mouseY)
  }
}

const _drop = () => {
  source.completed = true
  source.dispatchEvent(
      new Event('namu.drop', {
        bubbles: true,
        source
      })
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

  _freezing()
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

const _add = li => {
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
  root.querySelectorAll('li').forEach(_add)

  root.addEventListener('dragstart', _dragStart)
  root.addEventListener('dragover', _dragOver)
  root.addEventListener('dragenter', e => e.preventDefault())
  root.addEventListener('drop', _drop)
  root.addEventListener('dragend', _dragEnd)
  root.addEventListener('click', _clickKnob)

  return {
    add: _add,
    drop(fn) {
      root.addEventListener('namu.drop', e => fn.call(root, e))
      return this
    }
  }
}
