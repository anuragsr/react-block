import React, { Component } from 'react'
import TextInput from 'react-autocomplete-input'
import HttpService from '../services/HttpService'
import { l } from '../helpers/common'

import 'react-autocomplete-input/dist/bundle.css'

const getDisplayName = item => {
  let arr = item.split(":")
  , length = arr.length
  return [arr[length - 2], arr[length - 1]].join(":")
}

class TagInput extends Component {
  constructor(props) {
    super(props)
    this.http = new HttpService()
    this.state = {
      items: this.props.tags,
      input: '',
      autoCmplOpts: [],
      currRes: []
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleInputKeyDown = this.handleInputKeyDown.bind(this)
    this.handleRemoveItem = this.handleRemoveItem.bind(this)
    this.handleRequestOptions = this.handleRequestOptions.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ items: nextProps.tags }) 
  }

  handleInputChange(input){
    // l(input.length)
    let showAnim = false, showAttr = false
    if(input.length){
      // If input has length -> show loading animation
      showAnim = true
    }else{
      // If no length 
      showAnim = false
      if(this.state.items.length){
        // If list empty, hide attraction
        showAttr = true
      }else{
        // Else show attraction
        showAttr = false
      }
    }
    this.setState({ input })
    this.props.changeInput(showAnim, showAttr)
    // l(this.state.showAnim)
  }

  handleRequestOptions(part) {
    // l(part)
    if(part.length){
      // Simulate request to get tags here
      this.http
      .get('/api/v1/tags', { params: { query: part } })
      .then(res => {
        const currRes = res.data.results
        const autoCmplOpts = currRes.map(obj => obj.full_name)        
        // l(autoCmplOpts, currRes)
        this.setState({ autoCmplOpts, currRes })
      })
    }
  }

  handleInputKeyDown(evt){
    let items
    if ( evt.keyCode === 13 ) {
      let value = evt.target.value
      if(value !== ""){
        l(value)
        let chosenObj = this.state.currRes.filter(x => x.full_name === value)
        l(chosenObj) 
        if(chosenObj.length){
          items = [...this.state.items, chosenObj[0]]
          
          this.setState({
            items: items,
            input: '',
            autoCmplOpts: [],
            currRes: [],
          })
          
          let showAnim = false, showAttr = true
          this.props.changeTags(items)
          this.props.changeInput(showAnim, showAttr)
        }else{
          // chosenObj = [{id: "any", name: value, "image": "assets/tag-plh.png"}]
        }
        
      }
    }

    if ( this.state.items.length && evt.keyCode === 8 && !this.state.input.length ) {
      items = this.state.items.slice(0, this.state.items.length - 1)
      this.setState({ items })
    }
  }

  handleRemoveItem(index){
    return () => {
      let items = this.state.items.filter((item, i) => i !== index)
      let showAnim = false, showAttr = !!items.length
      this.setState({ items })
      this.props.changeTags(items)
      this.props.changeInput(showAnim, showAttr)
    }
  }

  render() {

    return (
      <div>        
        <TextInput 
          className="tag-inp form-control"
          placeholder="Add tag .."
          Component="input"
          trigger=""
          spacer=""
          matchAny={true}
          requestOnlyIfNoOptions={false}
          maxOptions={0}
          value={this.state.input}
          options={this.state.autoCmplOpts}
          onRequestOptions={this.handleRequestOptions}
          onChange={this.handleInputChange}
          onKeyDown={this.handleInputKeyDown}
        />

        {/* <input
          placeholder="Add tag .."
          className="tag-inp form-control"
          value={this.state.input}
          onChange={this.handleInputChange}
          onKeyDown={this.handleInputKeyDown} /> */}
        
        <ul className="tag-ctn">
          {this.state.items.map((item, i) => 
            <li key={i}>
              <div>
                <img src={item.image} alt="" />
                {getDisplayName(item.full_name)}
                <span onClick={this.handleRemoveItem(i)}>&times;</span>
              </div>
            </li>
          )}          
        </ul>

        {/* <pre>{JSON.stringify(this.state.items, null, 2)}</pre>
        <pre>{JSON.stringify(this.state.currRes, null, 2)}</pre> */}
      </div>
    )
  }
}

export default TagInput