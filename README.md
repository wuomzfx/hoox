# hook-store

## Use

### install

```javascript
npm install hooxjs -S
```

### create some store

```javascript
// counterStore.js
import hoox from 'hooxjs'

const state = {
  count: 1
}

export const { getHooxState, useHooxState, createContainer } = hoox(state)

// some action
export const up = () => {
  const [hooxState, setHooxState] = getHooxState()
  return setHooxState({
    count: hooxState.count + 1
  })
}

// some computed state
export const useDoubleCount = () => {
  const [hooxState] = useHooxState()
  return hooxState.count * 2
}
```

### use store

```javascript
import React from 'react'
import ReactDom from 'react-dom'
import { useHooxState, useDoubleCount, up } from './counterStore'

function Child() {
  const doubleCount = useDoubleCount()
  return <div>{doubleCount}</div>
}

function Counter() {
  const [hooxState] = useHooxState()
  return (
    <div>
      <div>{hooxState.count}</div>
      <div onClick={() => up()} />
      <Child />
    </div>
  )
}

const Container = createContainer(Counter)

ReactDom.render(<Container />, document.getElementById('#root'))
```

## API

### hoox(state)

```javascript
const state = { count: 0 }

export const {
  Provider,
  getHooxState,
  useHooxState,
  setHooxState,
  resetHooxState,
  createContainer
} = hoox(state)
```

### Provider

hooxState will combine the initialState of Provider props

```javascript
function App() {
  return <Provider initialState={{ count: 1 }}>
    <YourFunctionComponent>
  </Provider>
}
```

### createContainer

suger of Provider

hooxState will combine the initialState of createContainer args[1]

```javascript
const App = createContainer(YourFunctionComponent, { count: 2 })
```

### useHooxState

using this api, build your hook

```javascript
export const useDoubleCount = () => {
  const [hooxState, setHookSate, resetHooxState] = useHooxState()
  const { count } = hooxState
  return [count * 2, () => setHookSate({ count: count * 2 })]
}
```

### getHooxState

using this api, build your action

```javascript
export const up = () => {
  const [hooxState, setHooxState, resetHooxState] = getHooxState()
  return setHooxState({
    count: hooxState.count + 1
  })
}
```

### setHooxState

it behaves like `setState` of class Components, but no callback

```javascript
// get setHooxState from hoox(state)
const { setHooxState } = hoox({ count: 0 })
export const updateCount = newCount => {
  return setHooxState({
    count: newCount
  })
}
```

```javascript
// get setHooxState from getHooxState()
export const updateWithRecordOld = newCount => {
  const [oldState, setHooxState] = getHooxState()
  return setHooxState({
    count: newCount,
    oldCount: oldState.count
  })
}
```

```javascript
// aonther way to use oldState
export const up = (key, value) => {
  const [, setHooxState] = getHooxState()
  return setHooxState(oldState => ({
    count: oldState.count + 1
  }))
}
```

### resetHooxState

it behaves like `setState` of `useState` hook

```javascript
// get resetHooxState from hoox(state)
const { resetHooxState } = hoox({ count: 0 })
export const reset = (key, value) => {
  return resetHooxState({ count: 0 })
}
```

```javascript
// get resetHooxState from getHooxState() or useHooxState()
export const reset = (key, value) => {
  const [, , resetHooxState] = getHooxState()
  return resetHooxState({ count: 0 })
}
```
