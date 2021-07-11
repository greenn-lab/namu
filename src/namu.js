import './namu.scss'

const NAMU_SIZE = 24
const NAMU_SIZE_QTR = NAMU_SIZE / 4

let source,
    root,
    freeze,
    droppable,
    streamable,
    originalPlace = {},
    aim = 0

// --------------------------------------------------
// functions
// --------------------------------------------------
const _init = (e) => {
  source = e.target
  root = source.closest('.namu')
  freeze = null
  droppable = false
  streamable = true
  originalPlace = {}
  aim = e.offsetX

  source.classList.add('namu--dragging')

  originalPlace.next = source.nextElementSibling
  originalPlace.prev = source.previousElementSibling
  originalPlace.parent = source.parentElement

  e.dataTransfer.effectAllowed = 'move'
}

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
  freeze = !target
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
const _event = state => source.dispatchEvent(
    new Event(`namu.${state}`, {
      bubbles: true,
      started: source
    })
)

const _dragStart = e => {
  _init(e)
  _event('start')
}

const _dragOver = e => {
  e.preventDefault()

  _event('over')

  const target = e.target.closest('li')

  if (_outOfArea(target) || freeze?.includes(target)) {
    root.classList.add('namu--disabled')
    return
  }

  _freezing()
  root.classList.remove('namu--disabled')

  const mouseX = e.offsetX - aim
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

  _event('overed')
}

const _dragEnter = e => {
  e.preventDefault()
  _event('enter')
}

const _drop = e => {
  e.preventDefault()

  _event('drop')

  droppable = true
  _event('dropped')
}

const _dragEnd = () => {
  if (!droppable) {
    if (originalPlace.next) {
      originalPlace.next.before(source)
    } else if (originalPlace.prev) {
      originalPlace.prev.after(source)
    } else if (originalPlace.parent) {
      originalPlace.parent.append(source)
    }
  }

  source.classList.remove('namu--dragging')
  root.classList.remove('namu--disabled')

  _event('ended')
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
  _root.addEventListener('dragenter', _dragEnter)
  _root.addEventListener('drop', _drop)
  _root.addEventListener('dragend', _dragEnd)

  return {
    start(fn) {
      _root.addEventListener('namu.start', e => fn.call(_root, e))
      return this
    },
    over(fn) {
      _root.addEventListener('namu.over', e => fn.call(_root, e))
      return this
    },
    overed(fn) {
      _root.addEventListener('namu.overed', e => fn.call(_root, e))
      return this
    },
    entered(fn) {
      _root.addEventListener('namu.entered', e => fn.call(_root, e))
      return this
    },
    drop(fn) {
      _root.addEventListener('namu.drop', e => fn.call(_root, e))
      return this
    },
    dropped(fn) {
      _root.addEventListener('namu.dropped', e => fn.call(_root, e))
      return this
    },
    ended(fn) {
      _root.addEventListener('namu.ended', e => fn.call(_root, e))
      return this
    }
  }
}
