import './namu.scss'

const NAMU_SIZE = 24

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
  source.closest('.namu')?.dispatchEvent(
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

export const namu = root => {
  if (!root) {
    return
  }

  root.classList.add('namu')
  root.querySelectorAll('li').forEach(li => {
    li.setAttribute('draggable', 'true')

    const children = li.querySelector('ul')
    if (children) {
      _attachKnob(children)
    }
  })

  root.addEventListener('dragstart', _dragStart)
  root.addEventListener('dragover', _dragOver)
  root.addEventListener('dragenter', e => e.preventDefault())
  root.addEventListener('drop', _drop)
  root.addEventListener('dragend', _dragEnd)

  return {
    drop(fn) {
      root.addEventListener('namu.drop', e => fn.call(root, e))
      return this
    }
  }
}
