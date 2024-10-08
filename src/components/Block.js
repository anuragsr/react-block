import React, { Component } from 'react'
import Switch from 'react-switch'
import TagBlock from './TagBlock'
import TagGroupBlock from './TagGroupBlock'
import PlaceBlock from './PlaceBlock'
import PhotoBlock from './PhotoBlock'
import { l } from '../helpers/common'

export default class Block extends Component {
  
  constructor(props) {
    super(props)
    this.state = { 
      show: this.props.show,
    }
  }
  
  toggled = show => {
    this.setState({ show })
    if (this.props.type !== "Tag" && this.props.type !== "Tag Group")
      this.props.handleToggle(show, this.props.idx)
  }

  handlePlaceChanged = (place, placeRef) => this.props.placeChanged(place, placeRef)

  render() {
    return (
      <div className="m-4 block">
        <div className="block-title">
          <div>{this.props.type} Block</div>
          <Switch
            checked={this.state.show}
            onChange={this.toggled}
            uncheckedIcon={false}
            checkedIcon={false}
            handleDiameter={16}
            onColor="#1785fb"
            onHandleColor="#fff"
            height={20}
            width={36}
            className="react-switch"
          />
        </div>
        {
          this.state.show && 
          (
            this.props.type === "Place"?<PlaceBlock placeChanged={this.handlePlaceChanged}/>
            :this.props.type === "Tag"?<TagBlock/>
            :this.props.type === "Tag Group"?<TagGroupBlock/>
            :<PhotoBlock 
              placeObj={this.props.placeObj} 
              placeRef={this.props.placeRef}
              ref={instance => { this.photoBlock = instance }}
            />
          )
        }
      </div>      
    )
  }
}
