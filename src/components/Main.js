import React, { Component } from 'react'
import Block from './Block'
import { l } from '../helpers/common'

export default class Main extends Component {
  constructor(props){
    super(props)
    this.state = { 
      blocks: [], 
      placeObj: {},
      placeRef: {}
    }
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
      placeObj: {
        withPlace: b.includes("photo_block") && b.includes("place_block"),
        place: {}
      }
    })
  }

  handlePlaceChanged = (place, placeRef) => {
    // l(place)
    this.setState({ 
      placeObj: {
        ...this.state.placeObj,
        place: place.currPlace
      },
      placeRef
    })
  }

  handleToggle = (show, idx) => {
    
    let state = this.state
    state.blocks[idx].show = show
    
    let blocks = state.blocks
    , showPhoto = blocks.filter(bl => bl.type === "Photo")[0].show
    , showPlace = blocks.filter(bl => bl.type === "Place")[0].show
    , withPlace = showPhoto && showPlace

    this.setState({
      blocks: state.blocks,
      placeObj: {
        place: showPlace?state.placeObj.place:{},
        withPlace
      }
    })
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
              placeChanged={this.handlePlaceChanged}
              handleToggle={this.handleToggle}
              placeObj={this.state.placeObj} 
              placeRef={this.state.placeRef} />:null
        })}
      </div>
    )
  }
}