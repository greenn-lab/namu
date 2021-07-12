import './namu.scss'

const NAMU_SIZE = 24
const NAMU_SIZE_QTR = NAMU_SIZE / 4

let source

// --------------------------------------------------
// functions
// --------------------------------------------------
const _outOfArea = target => !target || !target.closest('.namu')

const _canBeChild = (mouseX, target) =>
    target.previousElementSibling && mouseX > NAMU_SIZE * 2
const _becomeChildTo = parent => {
  if (parent) {
    let children = parent.querySelector('ul')
    if (!children) {
      children = document.createElement('ul')
      parent.append(children)
      _attachKnob(children)
    }

    children.append(source)
  }
}

const _becomeBrotherTo = (brother, mouseY) => {
  if (source.contains(brother)) {
    return
  }

  if (mouseY < NAMU_SIZE / NAMU_SIZE_QTR) {
    brother.before(source)
  }
  if (mouseY > NAMU_SIZE - NAMU_SIZE_QTR) {
    brother.after(source)
  }
}

const _canBeParent = mouseX => mouseX < -NAMU_SIZE_QTR
    && !_outOfArea(source.parentElement?.parentElement)
const _becomeParentTo = target => {
  _becomeBrotherTo(target, 999)
}

const _freezing = (target) => {
  source.freeze = !target
      ? null
      : Array.from(target.querySelectorAll('li:not(.namu--dragging)'))
}

const _attachKnob = ul => {
  const knob = document.createElement('button')
  knob.classList.add('namu__knob')
  knob.addEventListener('click', () => {
    if (knob.classList.contains('namu__knob--purse')) {
      ul.removeAttribute('hidden')
      knob.classList.remove('namu__knob--purse')
    } else {
      ul.setAttribute('hidden', '')
      knob.classList.add('namu__knob--purse')
    }
  })

  ul.after(knob)
}

// --------------------------------------------------
// events
// --------------------------------------------------
const _dragStart = e => {
  source = e.target
  source.completed = false
  source.freeze = undefined
  source.aim = e.offsetX
  source.family = {
    next: source.nextElementSibling,
    prev: source.previousElementSibling,
    parent: source.parentElement
  }

  source.classList.add('namu--dragging')

  e.dataTransfer.effectAllowed = 'move'
}

const _dragOver = e => {
  e.preventDefault()

  const target = e.target.closest('li')

  if (_outOfArea(target) || source.freeze?.includes(target)) {
    e.dataTransfer.dropEffect = 'copy'
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
  source.closest('.namu').dispatchEvent(
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
}

export default function (_root) {
  if (!_root) {
    return
  }

  _root.classList.add('namu')
  _root.querySelectorAll('li').forEach(li => {
    li.setAttribute('draggable', 'true')

    const children = li.querySelector('ul')
    if (children) {
      _attachKnob(children)
    }
  })

  _root.addEventListener('dragstart', _dragStart)
  _root.addEventListener('dragover', _dragOver)
  _root.addEventListener('dragenter', e => e.preventDefault())
  _root.addEventListener('drop', _drop)
  _root.addEventListener('dragend', _dragEnd)

  return {
    drop(fn) {
      _root.addEventListener('namu.drop', e => fn.call(_root, e))
      return this
    }
  }
}
