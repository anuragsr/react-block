import React, { Component } from 'react'
import { l } from '../helpers/common'

export default class TagsComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: this.props.tags
    }
  }

  componentWillReceiveProps = nextProps => {
    this.setState({ 
      items: nextProps.tags    
    }) 
  }

  getDisplayName = item => {
    let arr = item.split(":")
    , length = arr.length
    return [arr[length - 2], arr[length - 1]].join(":")
  }

  handleClick = item => {
    // l(item)
    if(this.props.clickedTag) 
      this.props.clickedTag(item)
  }

  handleRemove = item => {
    this.props.removeTag(item)
  }

  render(){
    return (
      <div>
        <ul className={this.props.type==="default"?"tag-ctn":"tag-ctn sug"}>
          {this.state.items.map((item, i) => 
            <li onClick ={() => this.handleClick(item)} key={i} className={item.optional?"optional":""}>
              <div>
                <img src={item.image} alt="" />
                {this.getDisplayName(item.full_name)}
                <span onClick={() => this.handleRemove(item)}>{this.props.type==="default" && <span>&times;</span>}</span>
              </div>
            </li>
          )}
        </ul>        
      </div>
    )
  }
}