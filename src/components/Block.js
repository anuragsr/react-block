import React, { Component } from 'react'
import Switch from 'react-switch'
import TagBlock from './TagBlock'
import PlaceBlock from './PlaceBlock'
import PhotoBlock from './PhotoBlock'

export default class Block extends Component {
  
  constructor(props) {
    super(props)
    this.state = { show: this.props.show }
  }
  
  toggled = show => this.setState({ show })

  render() {
    return (
      <div className="m-4 block">
        <div className="block-title">
          <div>{this.props.type} Block</div>
          <Switch
            checked={this.state.show}
            onChange={this.toggled}
            onColor="#54b6b8"
            onHandleColor="#fff"
            handleDiameter={20}
            uncheckedIcon={false}
            checkedIcon={false}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={20}
            width={40}
            className="react-switch"
          />
        </div>
        {
          this.state.show && 
          (
            this.props.type === "Place"?<PlaceBlock/>
            :this.props.type === "Tag"?<TagBlock/>
            :<PhotoBlock/>
          )
        }
      </div>      
    )
  }
}
