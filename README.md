# namu
> "namu" is a tree as korean pronunciation.

## use case 1
```javascript
<script>
  const tree = document.querySelector('ul')

  tree.addEventListener('namu.drop', e => console.log('dropped', e)
  
  // trigger shove up <li/> elements from drop event 
  tree.addEventListener('namu.move', e => console.log('moved', e)

  namu(tree)
</script>
```
## use case 2
```javascript
<script>
  const tree = document.querySelector('ul')

  namu(tree)
  
  // with drop event
  namu(tree)
    .drop(e => console.table(e))
</script>
```


## demo
[![](https://i9.ytimg.com/vi/mhdRbHca0JI/mq2.jpg?sqp=CIi0tocG&rs=AOn4CLCqrBBz5_ZAhy6J-okGccb_spO49g)](https://youtu.be/mhdRbHca0JI)
[https://namu-greenn.netlify.app/](https://namu-greenn.netlify.app/)
