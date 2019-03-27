import React, { Component } from 'react'
import Block from './components/Block'

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.scss'
import { l } from './helpers/common';

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      blocks: []
    }
  }

  componentDidMount(){
    this.setState({
      blocks: [
        { type: "Photo", show: true},
        { type: "Place", show: false},
        { type: "Tag", show: false},
      ],
      withPlace: false
    })
  }

  handleToggle = (show, idx) => {
    // l(show, idx)
    let state = this.state
    state.blocks[idx].show = show
    this.setState({ state })
    // l(blocks)

    let blocks = this.state.blocks
    , showPhoto = blocks.filter(bl => bl.type === "Photo")[0].show
    , showPlace = blocks.filter(bl => bl.type === "Place")[0].show
    
    this.setState({ withPlace : showPhoto && showPlace })
  }
  
  render() {
    return (
      <div className="container">
        {this.state.blocks.map((bl, i) => {
          return <Block 
                  key={i} idx={i}
                  show={bl.show}
                  type={bl.type}
                  handleToggle={this.handleToggle}
                  withPlace={bl.type==="Photo"?this.state.withPlace:null} />
        })}
        {/* <Block show={!false} type="Photo" />
        <Block show={false} type="Place" />
        <Block show={!true} type="Tag" /> */}
      </div>
    )
  }
}