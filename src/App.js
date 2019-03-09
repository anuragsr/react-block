import React, { Component } from 'react'
import Block from './components/Block'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.scss'

class App extends Component {
  render() {
    return (
      <div>
        <div className="container">
          <Block show={false} type="Photo" />
          <Block show={false} type="Place" />
          <Block show={true} type="Tag" />
          <Block show={false} type="Tag" />
        </div>
      </div>      
    );
  }
}

export default App
