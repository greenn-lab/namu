import './namu.css'

const BRANCH_HEIGHT = 24
const BRANCH_HEIGHT_QTR = BRANCH_HEIGHT / 4

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
    target.previousElementSibling && mouseX > BRANCH_HEIGHT * 2
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
  if (mouseY < BRANCH_HEIGHT / BRANCH_HEIGHT_QTR) {
    brother.before(source)
  }
  if (mouseY > BRANCH_HEIGHT - BRANCH_HEIGHT_QTR) {
    brother.after(source)
  }
}

const _canBeParent = mouseX => mouseX < -BRANCH_HEIGHT_QTR
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
  knob.classList.add('namu-knob')
  knob.addEventListener('click', () => {
    if (knob.classList.contains('namu-knob--purse')) {
      ul.style.display = 'block'
      knob.classList.remove('namu-knob--purse')
    }
    else {
      ul.style.display = 'none'
      knob.classList.add('namu-knob--purse')
    }
  })

  console.log('attach a knob', ul.parentElement, knob)

  ul.parentElement.appendChild(knob)

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
  console.log(e.target, e.offsetX)
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

  console.log(e.offsetX, e.offsetY, aim)

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
