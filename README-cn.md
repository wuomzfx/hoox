# Hoox

[English](./README.md) | 简体中文

[![build](https://travis-ci.org/wuomzfx/hoox.svg)](https://travis-ci.org/wuomzfx/hoox)
[![test coverage](https://img.shields.io/codecov/c/github/wuomzfx/hoox.svg)](https://codecov.io/gh/wuomzfx/hoox)
[![downloads](https://img.shields.io/npm/dt/hooxjs.svg)](https://www.npmjs.com/package/hooxjs)
[![npm version](https://img.shields.io/npm/v/hooxjs.svg)](https://www.npmjs.com/package/hooxjs)

## 使用

### 安装

```javascript
npm install hooxjs -S
```

### 创建一个 Store

```javascript
// counterStore.js
import createHoox from 'hooxjs'

const state = {
  count: 1
}

export const { getHoox, useHoox, createContainer } = createHoox(state)

// 创建一个action
export const up = () => {
  const [hooxState, setHoox] = getHoox()
  return setHoox({
    count: hooxState.count + 1
  })
}

// 创建一个computed数据
export const useDoubleCount = () => {
  const [hooxState] = useHoox()
  return hooxState.count * 2
}
```

### 使用 Store

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

通过本`api`，初始化全局状态。

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

由于 hoox 基于`context`实现，故而消费全局状态的组件需要包裹在相应`Provider`下。

`Provider`还提供了一个 Prop，`initialState`。它可选地接收一个对象，它会与`createHoox`时传递的初始状态合并，成为 hoox 的最终全局状态初始值。

```javascript
function App() {
  return <Provider initialState={{ count: 1 }}>
    <YourFunctionComponent>
  </Provider>
}
```

### createContainer

这是一个`Provider`的语法糖。

`createContainer`的第一个参数是需要消费全局状态的函数式组件（只要根组件即可），第二个参数即同`Provider`的`initialState`，会与创建 `Store`时的状态合并成初始全局状态。

```javascript
const App = createContainer(YourFunctionComponent, { count: 2 })
```

### useHoox

本`api`主要用于函数式组件内直接消费/更新全局状态；或用于构建自定义全局 Hook。

**消费状态**

```javascript
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
```

**构建自定义全局 Hook**

```javascript
export const useDoubleCount = () => {
  const [hooxState, setHoox, resetHoox] = useHoox()
  const { count } = hooxState
  return [count * 2, () => setHoox({ count: count * 2 })]
}
```

### getHoox

`getHoox`常用于创建一个全局`action/effect`。切忌，`getHoox`获取的全局状态不具有响应式。因此，如无特殊需要，不应该在函数式组件内直接引用。

**创建一个 action**

```javascript
export const up = () => {
  const [hooxState, setHoox, resetHoox] = getHoox()
  return setHoox({
    count: hooxState.count + 1
  })
}
```

**如下使用，当全局状态变更时，`Counter`并不会重新渲染**

```javascript
function Counter() {
  const [hooxState] = getHoox()
  return (
    <div>
      <div>{hooxState.count}</div>
      <div onClick={() => up()} />
      <Child />
    </div>
  )
}
```

### setHoox

`setHoox`的行为跟类组件中的`setState`表现一致，会合并状态，但是没有回调。

`setHoox`可以直接从`createHoox(state)`的返回值中获取。

```javascript
const { setHoox } = createHoox({ count: 0 })
export const updateCount = newCount => {
  return setHoox({
    count: newCount
  })
}
```

`setHoox` 也可以直接从`getHoox()`或 `useHoox()`的返回值中获取。

```javascript
export const updateWithRecordOld = newCount => {
  const [oldState, setHoox] = getHoox()
  return setHoox({
    count: newCount,
    oldCount: oldState.count
  })
}
```

`setHoox`也支持传递一个函数，函数第一个入参为当前全局状态。

```javascript
export const up = () => {
  const [, setHoox] = getHoox()
  return setHoox(oldState => ({
    count: oldState.count + 1
  }))
}
```

### resetHoox

`resetHoox`的行为跟函数式组件中，`useState`返回的`setState`表现一致，它会重置全局状态。

`setHoox`可以直接从`createHoox(state)`的返回值中获取。

```javascript
const { resetHoox } = createHoox({ count: 0 })
export const reset = () => {
  return resetHoox({ newCount: 0 })
}
```

`resetHoox` 也可以直接从`getHoox()`或 `useHoox()`的返回值中获取。

```javascript
export const reset = () => {
  const [, , resetHoox] = getHoox()
  return resetHoox({ newCount: 0 })
}
```

### connect

将全局状态注入到`React`组件的`props`之中。

#### 函数式组件

```javascript
const { connect } = createHoox({ count: 0 })

const Counter = ({ count }) => {
  return <div>{count}</div>
}

export default connect(state => ({ count: state.count }))(Counter)
```

#### 类组件

```jsx
// jsx
import React from 'react'

const { connect } = createHoox({ count: 0 })

@connect(state => ({ count: state.count }))
export default class Counter extends React.PureComponent {
  render() {
    return <div>{this.props.count}</div>
  }
}
```

PS: 由于装饰器不能修改被装饰对象的返回类型，`connect`的装饰器语法目前暂不支持`TypeScript`。

```tsx
// tsx
import React from 'react'

const { connect } = createHoox({ count: 0 })

class Counter extends React.PureComponent<{ count: number }> {
  render() {
    return <div>{this.props.count}</div>
  }
}

export default connect(state => ({ count: state.count }))(Counter)
```
