import React, { Component } from 'react'
import Autosuggest from 'react-autosuggest'
import AutosuggestHighlightParse from 'autosuggest-highlight/parse'
import HttpService from '../services/HttpService'
import { l } from '../helpers/common'

const getDisplayName = item => {
  let arr = item.split(":")
  , length = arr.length
  return [arr[length - 2], arr[length - 1]].join(":")
}

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion.full_name

// Gets matches in the string
const getIndicesOf = (str, searchStr, caseSensitive) => {
  var searchStrLen = searchStr.length
  if (searchStrLen === 0) {
      return []
  }
  var startIndex = 0, index, indices = []
  if (!caseSensitive) {
    str = str.toLowerCase()
    searchStr = searchStr.toLowerCase()
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    startIndex = index + searchStrLen
    indices.push([index, startIndex])
  }
  return indices
}

// Use your imagination to render suggestions.
const renderSuggestion = (suggestion, { query }) => {  
  const suggestionText = `${suggestion.full_name}`
  const parts = AutosuggestHighlightParse(suggestionText, getIndicesOf(suggestionText, query))
  // l(suggestionText, parts)
  return (
    <div>
      {/* {suggestion.full_name}<br/> */}
      {
        parts.map((part, index) => {
          const className = part.highlight ? 'highlight' : null
          return (
            <span className={className} key={index}>{part.text}</span>
          )
        })
      }
    </div>
  )
}

export default class TagInput extends Component {
  constructor(props) {
    super(props)
    // Autosuggest is a controlled component.
    // This means that you need to provide an input value
    // and an onChange handler that updates this value (see below).
    // Suggestions also need to be provided to the Autosuggest,
    // and they are initially empty because the Autosuggest is closed.
    this.http = new HttpService()
    this.state = {
      items: this.props.tags,
      value: '',
      suggestions: [],
      showTags: this.props.showTags,
    }
  }

  componentWillReceiveProps = nextProps => {
    this.setState({ 
      items: nextProps.tags,
      showTags: nextProps.showTags,
    }) 
  }
  
  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions = value => {
    // l(value)
    let showAnim = true, showAttr = false
    this.props.changeInput(showAnim, showAttr)
    this.http
    .get('/api/v1/tags', { params: { query: value } })
    .then(res => {
      const currRes = res.data.results
      l("Total API Results:", currRes)
      let suggestions = currRes.filter(x => x.full_name.toLowerCase().includes(value.toLowerCase()))      
      l("Results containing current query:", suggestions)
      showAnim = false
      showAttr = true

      // To set filtered options 
      // this.setState({ suggestions })

      // To set all options 
      this.setState({ suggestions: currRes })
      
      this.props.changeInput(showAnim, showAttr)
    })
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    })
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    if(value.trim() !== "")
      this.getSuggestions(value)
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    })
  }

  onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    // l({ suggestion, suggestionValue, suggestionIndex, sectionIndex, method })
    // l(this.state)
    let items = [...this.state.items, suggestion], showAnim = false, showAttr = true
    this.setState({
      items,
      value: '',
      suggestions: []
    })
    this.props.changeTags(items)
    this.props.changeInput(showAnim, showAttr)
  }

  handleRemoveItem = index => {
    return () => {
      let items = this.state.items.filter((item, i) => i !== index)
      let showAttr = !!items.length
      this.setState({ items })
      this.props.changeTags(items)
      this.props.changeInput(false, showAttr)
    }
  }

  render() {
    const { value, suggestions } = this.state

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      className: 'tag-inp form-control',
      placeholder: 'Add tag ..',
      value,
      onChange: this.onChange
    }

    // Finally, render it!
    return (
      <div>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          onSuggestionSelected={this.onSuggestionSelected}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          highlightFirstSuggestion={true}
          inputProps={inputProps}
        />
          <ul className="tag-ctn">
            {
            this.state.showTags && 
            this.state.items.map((item, i) => 
              <li key={i}>
                <div>
                  <img src={item.image} alt="" />
                  {getDisplayName(item.full_name)}
                  <span onClick={this.handleRemoveItem(i)}>&times;</span>
                </div>
              </li>
            )}        
          </ul>        
      </div>
    )
  }
}