import React, { Component } from 'react'
import Autosuggest from 'react-autosuggest'
import AutosuggestHighlightParse from 'autosuggest-highlight/parse'
import HttpService from '../services/HttpService'
import { l } from '../helpers/common'

const getSuggestionValue = suggestion => suggestion.full_name

const getIndices = (str, searchStr, caseSensitive) => {
  let searchStrLen = searchStr.length
  if (searchStrLen === 0) {
      return []
  }
  let startIndex = 0, index, indices = []
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

const renderSuggestion = (suggestion, { query }) => {  
  const suggestionText = `${suggestion.full_name}`
  const parts = AutosuggestHighlightParse(suggestionText, getIndices(suggestionText, query))
  return (
    <div>
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

export default class AutoCompleteComponent extends Component {
  constructor(props) {
    super(props)
    this.http = new HttpService()
    this.state = {
      value: '',
      suggestions: [],
    }
  }
  
  getSuggestions = value => {
    let showAnim = true, showAttr = false, url, params
    if(this.props.changeInput)
      this.props.changeInput(showAnim, showAttr)

    if(this.props.type === "tag"){
      if(this.props.parent === "place"){
        url = '/api/v1/tags'
        params = { 
          query: value,
          place_id: this.props.placeId
        }
      }else if(this.props.parent === "tag"){
        url = '/api/v1/tags'
        params = { 
          query: value
        }
      }
    }else{
      url = '/api/v1/places'
      params = { 
        query: value,
        approved: true
      }
    }

    this.http
    .get(url, params)
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
      if(this.props.changeInput)
        this.props.changeInput(showAnim, showAttr)
    })
    .catch(error => {
      // error callback
      l(error)
    })
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    })
  }

  onSuggestionsFetchRequested = ({ value }) => {
    if(value.trim() !== "")
      this.getSuggestions(value)
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [] 
    })
  }

  onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    // l({ suggestion, suggestionValue, suggestionIndex, sectionIndex, method })
    this.props.optionSelected(suggestion)
    this.setState({
      value: '',
      suggestions: []
    })
  }

  render() {
    const { value, suggestions } = this.state
    const inputProps = this.props.inputProps

    inputProps.value = value
    inputProps.onChange = this.onChange

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
      </div>
    )
  }
}