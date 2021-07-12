import namu from './src/namu'

namu(document.querySelector('#root'))

namu(document.querySelector('#root2'))
.drop(function () {
  console.log('called event "drop"!!')
})
