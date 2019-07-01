import React, { Component } from 'react'
import AutoCompleteComponent from './AutoCompleteComponent'
import { l } from '../helpers/common'

export default class TagsComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: this.props.tags,
      showAuto: this.props.showAuto,
      mainChosen: this.props.mainChosen,
    }
  }

  componentWillReceiveProps = nextProps => {
    this.setState({ 
      items: nextProps.tags,      
      showAuto: nextProps.showAuto,
      mainChosen: nextProps.mainChosen      
    }) 
  }

  getDisplayName = item => {
    let arr = item.split(":")
    , length = arr.length
    return [arr[length - 2], arr[length - 1]].join(":")
  }

  handleClick = item => {
    if(this.props.clickedTag) 
      this.props.clickedTag(item)
  }

  handleRemove = item => {
    this.props.removeTag(item)
  }

  handleAdd = tag => {
    tag.isMain = true
    this.props.addTag(tag)
  }

  toggleMainAutosuggest = () => {
    let showAuto = !this.state.showAuto
    this.setState({ showAuto })
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

          let itemClass = ""
          if(item.optional) itemClass+= "optional"
          else if(item.isMain) itemClass+= "main"

          return (
            <li 
              onClick={() => this.handleClick(item)} key={i} 
              className={itemClass}
            >
            <div>
              <img src={currImg} alt="" />
              <span className="tag-name">{this.getDisplayName(item.full_name)}</span>              
              {this.props.type === "default" && 
              <img className="del-tag" onClick={() => this.handleRemove(item)} src="assets/delete-tag.svg" alt="" />}              
            </div>
          </li>)
        })}

        {(
          this.state.items.length && 
          !this.state.mainChosen && 
          this.props.isGroup
        )?<li className="tag-main">
            <div><img onClick={this.toggleMainAutosuggest} src="assets/rectangle.svg"/></div>
            {this.state.showAuto && <div className="ctn-auto">
              <div className="arrow-box">
                <AutoCompleteComponent
                  inputProps={{
                    className: 'tag-inp',
                    placeholder: 'Find the tag for Expectation Block ..',
                  }}
                  type="tag"
                  parent="tag"
                  optionSelected={this.handleAdd}
                />
                <img onClick={this.toggleMainAutosuggest} src="assets/bounds.svg" alt=""/>
              </div>
            </div>}
          </li>
        :""}
      </ul>
    )
  }
}