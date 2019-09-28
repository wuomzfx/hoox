# Hoox

[![build](https://travis-ci.org/wuomzfx/hoox.svg)](https://travis-ci.org/wuomzfx/hoox)
[![test coverage](https://img.shields.io/codecov/c/github/wuomzfx/hoox.svg)](https://codecov.io/gh/wuomzfx/hoox)
[![downloads](https://img.shields.io/npm/dt/hooxjs.svg)](https://www.npmjs.com/package/hooxjs)
[![npm version](https://img.shields.io/npm/v/hooxjs.svg)](https://www.npmjs.com/package/hooxjs)

## Use

### install

```javascript
npm install hooxjs -S
```

### create some store

```javascript
// counterStore.js
import createHoox from 'hooxjs'

const state = {
  count: 1
}

export const { getHoox, useHoox, createContainer } = createHoox(state)

// some action
export const up = () => {
  const [hooxState, setHoox] = getHoox()
  return setHoox({
    count: hooxState.count + 1
  })
}

// some computed state
export const useDoubleCount = () => {
  const [hooxState] = useHoox()
  return hooxState.count * 2
}
```

### use store

```javascript
import React from 'react'
import ReactDom from 'react-dom'
import { useHoox, useDoubleCount, up } from './counterStore'

function Child() {
  const doubleCount = useDoubleCount()
  return <div>{doubleCount}</div>
}

function Counter() {
  const [hooxState] = useHoox()
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

### createHoox

```javascript
import createHoox from 'hooxjs'

const state = { count: 0 }

export const {
  Provider,
  getHoox,
  useHoox,
  setHoox,
  resetHoox,
  createContainer
} = createHoox(state)
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

### useHoox

using this api, build your hook

```javascript
export const useDoubleCount = () => {
  const [hooxState, setHoox, resetHoox] = useHoox()
  const { count } = hooxState
  return [count * 2, () => setHoox({ count: count * 2 })]
}
```

### getHoox

using this api, build your action

```javascript
export const up = () => {
  const [hooxState, setHoox, resetHoox] = getHoox()
  return setHoox({
    count: hooxState.count + 1
  })
}
```

### setHoox

it behaves like `setState` of class Components, but no callback

```javascript
// get setHoox from createHoox(state)
const { setHoox } = createHoox({ count: 0 })
export const updateCount = newCount => {
  return setHoox({
    count: newCount
  })
}
```

```javascript
// get setHoox from getHoox() or useHoox()
export const updateWithRecordOld = newCount => {
  const [oldState, setHoox] = getHoox()
  return setHoox({
    count: newCount,
    oldCount: oldState.count
  })
}
```

```javascript
// aonther way to use oldState
export const up = () => {
  const [, setHoox] = getHoox()
  return setHoox(oldState => ({
    count: oldState.count + 1
  }))
}
```

### resetHoox

it behaves like `setState` of `useState` hook

```javascript
// get resetHoox from createHoox(state)
const { resetHoox } = createHoox({ count: 0 })
export const reset = () => {
  return resetHoox({ newCount: 0 })
}
```

```javascript
// get resetHoox from getHoox() or useHoox()
export const reset = () => {
  const [, , resetHoox] = getHoox()
  return resetHoox({ newCount: 0 })
}
```
