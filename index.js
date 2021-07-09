import namu from "./src/namu"

namu(document.querySelector('#root'))

namu(document.querySelector('#root2'))
.start(function () {
  console.log('called event "start"')
})
.over(function () {
  console.log('called event "over"')
})
.overed(function () {
  console.log('called event "overed"')
})
.entered(function () {
  console.log('called event "entered"')
})
.drop(function () {
  console.log('called event "drop"')
  return false
})
.dropped(function () {
  console.log('called event "dropped"')
})
.ended(function () {
  console.log('called event "ended"')
})
