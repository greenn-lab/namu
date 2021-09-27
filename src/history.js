import {namu} from './namu'

const stack = []
let cursor = 0

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && ('z' === e.key || 'Z' === e.key)) {
    e.shiftKey
        ? redo()
        : undo()
  }
})

const undo = () => {
  if (cursor > 0) {
    --cursor

    const {before} = stack[cursor]
    rewind(before)

    namu.dispatch('undo', before.source, {
      stack,
      cursor
    })
  }
}

const redo = () => {
  if (cursor < stack.length) {
    const {after} = stack[cursor];
    rewind(after)

    namu.dispatch('redo', after.source, {
      stack,
      cursor
    })


    ++cursor
  }
}

const rewind = item => {
  if (item.prev) {
    item.prev.after(item.source)
  } else if (item.next) {
    item.next.before(item.source)
  } else if (item.parent) {
    item.parent.append(item.source)
  }

  item.source.classList.add('namu__branch--blink')
  setTimeout(() =>
      item.source.classList.remove('namu__branch--blink'), 1000)

}

const history = (before, after) => {
  if (cursor < stack.length) {
    stack.splice(cursor)
  }

  stack.push({before, after})

  ++cursor
}

export default history
