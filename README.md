# tracker

a simple frontend monitoring sdk

## usage

```js
new tracker({
  // api for monitoring
  requestUrl: "http://localhost:9000/tracker",
  // monitor for history event
  historyTracker: true,
  // monitor for hash event
  hashTracker: true,
  // monitor for dom element
  domTracker: true,
  // monitor for js error (error and promise)
  jsError: true,
});
```

monitor for dom element

```html
<div target-key>test</div>
```
