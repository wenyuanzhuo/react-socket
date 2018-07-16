import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import ChatAllContainer from './components/chatall'
import LoginContainer from './components/login'
import createSocketMiddleware from './redux_middleware'
import io from 'socket.io-client'
import reducers from './reducer'
import './index.less'
var composes = (...arr) => {
  return args => arr.reduceRight((composed, f) => f(composed), args)
}
var socketMiddleware = composes(createSocketMiddleware)(io())
var store = createStore(
  reducers,
  applyMiddleware(socketMiddleware)
);

render(
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path='/login' component={LoginContainer}/>
      <Route path='/' component={ChatAllContainer}/>
    </Router>
  </Provider>
  ,
  document.getElementById('test'));
