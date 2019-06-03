import React, { Component } from 'react'

import AutoCompleteComponent from './AutoCompleteComponent'
import TagsComponent from './TagsComponent'
import SliderComponent from './SliderComponent'
import HttpService from '../services/HttpService'
import { l, rand, auth } from '../helpers/common'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretRight } from '@fortawesome/free-solid-svg-icons'

const checkId = rand(5)
const checkId_r = rand(5)
let suggestions = [], timer

export default class TagBlock extends Component {
  
  constructor(props) {
    super(props)
    this.http = new HttpService()
    this.state = {
      showNotif: false,
      notifType: "submit",
      showAnim: false,
      showAttr: false,
      showTags: true,
      showSugTags: false,
      toggleSugTags: true,
      randomMode: false,
      allowAdd: true,
      bots: [],
      currBot: {},
      tags: [],
      suggTags: [],
      ml: false,
      att: {
        manual: 0,
        auto: 0
      },
      lastTagId: 0,
    }
  }

  componentDidMount = () => {
    this.http
    .get('/api/v1/bots', { from_ml_page: true })
    .then(res => {
      let bots = res.data.results, currBot = bots[0]
      this.setState({ bots, currBot })      
      this.getSuggTags()
    })
    .catch(error => {
      // error callback
      l(error)
    })
  }
  
  toggleRandom = e => {
    let randomMode = e.target.checked
    if(randomMode){
      this.getRandomTags()
    }
    this.setState({ randomMode })
  }
  
  getRandomTags = () => {
    this.http
    .get('/api/v1/random_tags')
    .then(res => {
      let tags = res.data.results
      this.setState({
        tags, 
        showTags: true,
        showAttr: true,
        att: {
          manual: 0,
          auto: 0
        }
      })
    })
    .catch(error => {
      // error callback
      l(error)
    })    
  }

  getSuggTags = () => {
    this.http
    .get('/api/v1/suggested_tags')
    .then(res => {
      let suggTags = res.data.results
      // l(suggTags)
      this.setState({ 
        showSugTags: true, 
        suggTags 
      })
      if(this.state.randomMode){
        this.getRandomTags()
      }
    })
  }

  nextBlock = () => {
    this.getSuggTags()
    if(!this.state.randomMode){    
      this.setState({         
        tags: [],
        showAttr: false
      })
    }
  }

  inputChanged = (showAnim, showAttr) => this.setState({ showAnim, showAttr })
  
  botChanged = e => {
    let currBot = this.state.bots.filter(bot => { return bot.id === parseInt(e.target.value) })[0]
    this.setState({ currBot })
  }
  
  mlChanged = e => this.setState({ ml: e.target.checked })

  tagSuggested = tag => {
    // l(tag)
    if(this.state.allowAdd){
      let tags = [...this.state.tags, tag]
      , suggTags = this.state.suggTags.filter(curr => curr.id !== tag.id)
      , showAttr = !!tags.length
      , showTags = !!tags.length
  
      this.setState({ tags, suggTags, showAttr, showTags }, this.tagsChanged)
    }
  }
  
  tagAdded = tag => {
    let tags = [...this.state.tags, tag]
    , showTags = !!tags.length

    this.setState({ tags, showTags }, this.tagsChanged)
    setTimeout(() => {
      suggestions.length = 0
    }, 200)
  }

  tagRemoved = tag => {
    let tags = this.state.tags.filter(curr => curr.id !== tag.id), showAttr
    if(tags.length === 0){
      showAttr = false
    }else{
      showAttr = true
    }

    this.setState({ showAttr, tags }, this.tagsChanged)
    // this.tagsChanged()
  }

  tagsChanged = () => {
    if(this.state.tags.length && this.state.ml){
      // l("Call ML with list of tags if ML on")
      this.http
      .post('/api/v1/get_attraction_for_tags', { 
        tags_ids: this.state.tags.map(x => x.id) 
      })
      .then(res => {
        // l(res.data)
        let attr = res.data.attraction?res.data.attraction:0
        this.setState( state => ({
          att: {
            ...state.att,
            manual: attr,
            auto: attr
          }
        }))
      })
      .catch(error => {
        // error callback
        l(error)
      }) 
    }
  }
  
  attChanged = val => {
    this.setState( state => ({
      att: {
        ...state.att,
        manual: val
      }
    }))
  }

  undo = () => {
    let params = { type: 'tag', id: this.state.lastTagId }
    // l(params)
    clearTimeout(timer)
    this.http
    .get('/api/v1/undo', params)
    .then(res => {
      l(res)
      this.setState({
        showNotif: true, 
        notifType: "undo"
      })
      
      timer = setTimeout(() => {
        this.setState({
          allowAdd: true,
          showNotif: false,
          notifType: "submit"
        })
        // this.getSuggTags()
      }, 5000)
    })
  }

  onUndo = () => this.setState({ showNotif: false, notifType: "submit" })

  submit = () => {
    // l(this.state)
    if(this.state.tags.length){
      clearTimeout(timer)
      this.setState({ 
        showAttr: false,
        showNotif: false,
        notifType: "submit",
        att: {
          manual: 0,
          auto: 0
        },
        tagsText: this.state.tags.map((t, i) => {
          if(i === this.state.tags.length - 1)
            return t.full_name
          else
            return t.full_name + ", "
        }),
        tags: [],
        // showTags: false,
        allowAdd: false,
      })

      const request = {
        tags_ids: this.state.tags.map(x => x.id),
        ML_attraction: this.state.ml?this.state.att.auto:"None",
        editor_attraction: this.state.att.manual, 
        editor_id: 1,
        bot_id: this.state.currBot.id,
      }
      // l(request)
  
      this.http
      .post('/api/v1/send_attraction_for_tags', request, auth)
      .then(res => {
        l(res.data)
        //  Show notif, undo
        this.getSuggTags()
        this.setState({ 
          showNotif: true, 
          lastTagId: res.data.id 
        })

        timer = setTimeout(() => {
          !this.state.tags.length &&
          this.setState({ 
            showAttr: false,
          })
          
          if(this.state.notifType === "submit"){
            this.setState({ 
              allowAdd: true,
              showNotif: false 
            })
          }
        }, 5000)
      })    
    }
  }

  handleSuggestions = s => suggestions = s

  handleKey = event => {
    event.preventDefault()
    // l(event.keyCode, "Tag Block")
    if (event.keyCode === 13) {
      // Enter Key
      l(suggestions)
      if (!suggestions.length) {
        this.submit()
      }
    }
  }

  render() {
    return (<>
      {this.state.showNotif && <div className="block-notif">
        {this.state.notifType === "submit" && <>
          <div className="col-lg-11 px-0">
            <div className="title">
              <span>New tag block created!&nbsp;&nbsp;</span>
              <span className="tag-text">Tags: {this.state.tagsText}</span>
            </div>
          </div>
          <div className="col-lg-1 pr-0">
            <div onClick={this.undo} className="undo float-right">Undo</div>
          </div>
        </>}
        {this.state.notifType === "undo" && 
        <div className="col-lg-12 px-0 text-center">
          <div className="title">
            <span>Tag block deleted successfully!&nbsp;&nbsp;</span>
            <span onClick={this.onUndo} className="undo">Ok</span>
          </div>
        </div>}
      </div>}
      <div className="block-content" tabIndex="0" onKeyUp={this.handleKey}>
        <div className="title row">
          <div className="col-lg-6">
            Create new tag block   
          </div>
          <div className="col-lg-6 text-right">
            <button onClick={this.nextBlock} className="btn btn-accent-outline">
              Next&nbsp;&nbsp;<FontAwesomeIcon icon={faCaretRight} />
            </button>
            <button onClick={this.submit} disabled={!this.state.tags.length} className="ml-3 btn btn-accent">Submit</button>
          </div>
        </div>        
        <div className="body">
          <div className="row align-items-center">
            <div className="col-lg-7">
              {this.state.bots.length > 0 && <>
                <div
                  className="bot-img"
                  style={{ backgroundImage: `url(${this.state.currBot.avatar})` }}
                >
                </div>
                <select
                  className="custom"
                  value={this.state.currBot.id}
                  onChange={this.botChanged}
                >
                  {this.state.bots.map(function (bot, idx) {
                    return (
                      <option key={bot.id} value={bot.id}>{bot.name}</option>
                    )
                  })}
                </select>
              </>}
            </div>
            <div className="col-lg-5 text-right">
              <div className="custom-control custom-checkbox">
                <input checked={this.state.randomMode ? "checked" : ""} onChange={this.toggleRandom} type="checkbox" className="custom-control-input" id={checkId_r} />
                <label className="custom-control-label" htmlFor={checkId_r}>Random Mode</label>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6">
              <AutoCompleteComponent
                inputProps={{
                  className: 'tag-inp form-control',
                  placeholder: 'Add tag ..',
                }}
                type="tag"
                parent="tag"
                changeInput={this.inputChanged}
                getCurrSugg={this.handleSuggestions}
                optionSelected={this.tagAdded}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="tag-outer">
                {(this.state.tags.length === 0) &&
                  <div className="no-tags-plh">
                    <div className="inner">
                      <img src="assets/start-add.svg" alt="" />
                      <span>Start adding tags</span>
                    </div>
                  </div>
                }
                {this.state.showTags &&
                  <TagsComponent
                    type="default"
                    tags={this.state.tags}
                    removeTag={this.tagRemoved}
                  />}
              </div>
            </div>          
          </div>
          <div className="row">
            <div className="col-lg-6">
              {/* ShowAnim: <pre>{JSON.stringify(this.state.showAnim, null, 2)}</pre> */}
              {/* ShowAttr: <pre>{JSON.stringify(this.state.showAttr, null, 2)}</pre> */}
              {this.state.showAnim &&
                <div className="ctn-anim">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
              </div>}
              {/* {<div style={{ display: this.state.showAttr?"block":"none" }}>
                <SliderComponent att={this.state.att} changeAtt={this.attChanged} />
              </div>} */}
              <SliderComponent att={this.state.att} changeAtt={this.attChanged} />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6">
              <div className="custom-control custom-checkbox">
                <input checked={this.state.ml?"checked":""} onChange={this.mlChanged} type="checkbox" className="custom-control-input" id={checkId} />
                <label className="custom-control-label" htmlFor={checkId}>Turn On ML</label>
              </div>
            </div>
          </div>                
          <div className="row">
            <div className="col-lg-12">
              {this.state.showSugTags && <>
                <div className="tags-title">
                  Suggested Tags&nbsp;&nbsp;                  
                  <img src="assets/plus.svg" alt=""
                    style={{
                      display: !this.state.toggleSugTags ? "inline-block" : "none",
                      cursor: "pointer",
                      position: "relative",
                      top: 0, left: 3
                    }}
                    onClick={() => this.setState({
                      toggleSugTags: !this.state.toggleSugTags
                    })}
                  />                  
                  <img src="assets/minus.svg" alt=""
                    style={{
                      display: this.state.toggleSugTags ? "inline-block" : "none",
                      cursor: "pointer",
                      position: "relative",
                      top: -3, left: 3
                    }}
                    onClick={() => this.setState({
                      toggleSugTags: !this.state.toggleSugTags
                    })}
                  />
                </div>
                {this.state.toggleSugTags &&
                <TagsComponent
                  type="suggested"
                  tags={this.state.suggTags}
                  clickedTag={this.tagSuggested}
                />}
              </>}
            </div>
          </div>
        </div>
      </div>
    </>
    )
  }
}