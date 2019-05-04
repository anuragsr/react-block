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
      <ul className={this.props.type==="default"?"tag-ctn":"tag-ctn sug"}>
        {this.state.items.map((item, i) => {
          let currImg
          if (this.props.type === "default"){
            currImg = item.image !== null ? item.image : "assets/tag-plh.png"
          } else{
            currImg = item.image !== null ? item.image : "assets/tag-plh-sug.png"
          }
          return <li onClick={() => this.handleClick(item)} key={i} className={item.optional ? "optional" : ""}>
            <div>
              <img src={currImg} alt="" />
              <span>{this.getDisplayName(item.full_name)}</span>              
              {this.props.type === "default" && 
              <img className="del-tag" onClick={() => this.handleRemove(item)} src="assets/delete-tag.svg" alt="" />}              
            </div>
          </li>
        })}
      </ul>
    )
  }
}