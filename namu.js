const BRANCH_HEIGHT = 24

let root,
  events = {},
  source,
  freeze,
  droppable,
  originalPlace = {},
  aim = 0

// --------------------------------------------------
// functions
// --------------------------------------------------
const _init = () => {
  droppable = false
  originalPlace = {}
}

const _buildUpSource = (e) => {
  source = e.target
  aim = e.pageX - source.getBoundingClientRect().left

  originalPlace.next = source.nextElementSibling
  originalPlace.prev = source.prevElementSibling

  source.classList.add('namu--dragging')
}

const _event = (state) => events[state] && events[state](source)
const _outOfArea = (target) => !root.contains(target)

const _canBeChild = (target, mouseX) =>
  target.previousElementSibling && mouseX > BRANCH_HEIGHT
const _becomeChildTo = (parent) => {
  if (parent) {
    let children = parent.querySelector('ul')
    if (!children) {
      parent.append((children = document.createElement('ul')))
    }

    children.prepend(source)
  }
}

const _canBeBrother = (mouseX) => mouseX < BRANCH_HEIGHT
const _becomeBrotherTo = (brother, mouseY) => {
  if (mouseY < 4) brother.before(source)
  if (mouseY > BRANCH_HEIGHT - 4) brother.after(source)
}

const _canBeParent = (mouseX) =>
  !_outOfArea(source.parentElement?.parentElement) && mouseX < -4
const _becomeParentTo = (target) => {
  _becomeBrotherTo(target, 999)
  _freezing()
}
const _freezing = () => {
  freeze = true
  setTimeout(() => (freeze = false), 500)
}

// --------------------------------------------------
// events
// --------------------------------------------------
const _dragStart = (e) => {
  _init()
  _buildUpSource(e)
  _event('started')
}

const _dragOver = (e) => {
  e.preventDefault()

  const target = e.target.closest('li')
  if (!target || _outOfArea(target) || freeze) return

  const { left, top } = target.getBoundingClientRect()
  const mouseX = e.pageX - left - aim
  const mouseY = e.pageY - top

  if (source === target) {
    if (_canBeChild(target, mouseX)) {
      _becomeChildTo(source.previousElementSibling)
    } else if (_canBeParent(mouseX)) {
      _becomeParentTo(source.parentElement.parentElement)
    }
  } else if (_canBeBrother(mouseX)) {
    _becomeBrotherTo(target, mouseY)
  }
}

const _dragEnter = (e) => {
  e.preventDefault()
}

const _drop = (e) => {
  droppable = true
  _event('dropped')
}

const _dragEnd = (e) => {
  if (!droppable) {
    originalPlace.next && originalPlace.next.before(source)
    originalPlace.prev && originalPlace.prev.next(source)
  }

  source.classList.remove('namu--dragging')

  _event('ended')
}

export default (_root, _events) => {
  if (!_root) return

  root = _root
  events = Object.assign({}, _events)

  root.classList.add('namu')
  root
    .querySelectorAll('li')
    .forEach((el) => el.setAttribute('draggable', 'true'))

  root.addEventListener('dragstart', _dragStart)
  root.addEventListener('dragover', _dragOver)
  root.addEventListener('dragenter', _dragEnter)
  root.addEventListener('drop', _drop)
  root.addEventListener('dragend', _dragEnd)
}
