import './namu.css'

const NAMU_SIZE = 24
const NAMU_SIZE_QTR = NAMU_SIZE / 4

let source,
    freeze,
    droppable,
    streamable,
    originalPlace = {},
    aim = 0

// --------------------------------------------------
// functions
// --------------------------------------------------
const _init = (e) => {
  droppable = false
  streamable = true
  originalPlace = {}

  source = e.target
  aim = e.offsetX
}

const _buildUpSource = () => {
  originalPlace.next = source.nextElementSibling
  originalPlace.prev = source.previousElementSibling
  originalPlace.parent = source.parentElement

  source.classList.add('namu--dragging')
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
const _event = state => streamable && source.dispatchEvent(
    new Event(`namu.${state}`, {
      bubbles: true,
      started: source
    })
)

const _dragStart = e => {
  _init(e)

  _event('start')
  if (false === streamable) {
    e.preventDefault()
    return
  }

  _buildUpSource()
}

const _dragOver = e => {
  e.preventDefault()

  _event('over')
  if (false === streamable) {
    return
  }

  const target = e.target.closest('li')

  if (_outOfArea(target) || freeze?.includes(target)) {
    return
  }

  _freezing()

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
  if (false === streamable) {
    return
  }

  droppable = true
  _event('dropped')
}

const _dragEnd = () => {
  if (!droppable) {
    originalPlace.next && originalPlace.next.before(source)
    originalPlace.prev && originalPlace.prev.after(source)
    originalPlace.parent && originalPlace.parent.append(source)
  }

  source.classList.remove('namu--dragging')

  _event('ended')
}

export default function (root) {
  if (!root) {
    return
  }

  root.classList.add('namu')
  root
  .querySelectorAll('li')
  .forEach(li => {
    li.setAttribute('draggable', 'true')

    const children = li.querySelector('ul')
    if (children) {
      _attachKnob(children)
    }

  })

  root.addEventListener('dragstart', _dragStart)
  root.addEventListener('dragover', _dragOver)
  root.addEventListener('dragenter', _dragEnter)
  root.addEventListener('drop', _drop)
  root.addEventListener('dragend', _dragEnd)

  return {
    start(fn) {
      root.addEventListener('namu.start', e => streamable = fn.call(root, e))
      return this
    },
    over(fn) {
      root.addEventListener('namu.over', e => streamable = fn.call(root, e))
      return this
    },
    overed(fn) {
      root.addEventListener('namu.overed', e => fn.call(root, e))
      return this
    },
    entered(fn) {
      root.addEventListener('namu.entered', e => fn.call(root, e))
      return this
    },
    drop(fn) {
      root.addEventListener('namu.drop', e => streamable = fn.call(root, e))
      return this
    },
    dropped(fn) {
      root.addEventListener('namu.dropped', e => fn.call(root, e))
      return this
    },
    ended(fn) {
      root.addEventListener('namu.ended', e => fn.call(root, e))
      return this
    }
  }
}
