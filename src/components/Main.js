import React, { Component } from 'react'
import Block from './Block'
import { l } from '../helpers/common'

export default class Main extends Component {
  constructor(props){
    super(props)
    this.state = { blocks: [] }
  }
  
  componentDidMount(){
    // l(this.props)
    let b = this.props.blocks
    this.setState({
      blocks: [
        { type: "Photo", show: true, toRender: b.includes("photo_block") },
        { type: "Place", show: true, toRender: b.includes("place_block") },
        { type: "Tag", show: true, toRender: b.includes("tag_block") },
      ],
      withPlace: true,
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
  
  render(){
    return (
      <div className="container">
        {this.state.blocks.map((bl, i) => {
          return bl.toRender?
            <Block 
              key={i} idx={i}
              show={bl.show}
              type={bl.type}
              handleToggle={this.handleToggle}
              withPlace={this.state.withPlace} />:null
        })}
      </div>
    )
  }
}