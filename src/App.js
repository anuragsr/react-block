import React, { Component } from 'react'
import Block from './components/Block'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.scss'

export default class App extends Component {
  render() {
    return (
      <div className="container">
        <Block show={false} type="Photo" />
        <Block show={!false} type="Place" />
        <Block show={!true} type="Tag" />
      </div>
    )
  }
}