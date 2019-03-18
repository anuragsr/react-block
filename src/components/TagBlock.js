import React, { Component } from 'react'
import Switch from 'react-switch'

import AutoCompleteComponent from './AutoCompleteComponent'
import TagsComponent from './TagsComponent'
import SliderComponent from './SliderComponent'
import HttpService from '../services/HttpService'
import { l, rand } from '../helpers/common'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusSquare, faMinusSquare } from '@fortawesome/free-regular-svg-icons'
const checkId = rand(5)

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
    .get('/api/v1/bots')
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
  
  toggleRandom = randomMode => {
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
      l(suggTags)
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
  
      this.setState({ tags, suggTags, showAttr, showTags })
      this.tagsChanged()
    }
  }
  
  tagAdded = tag => {
    let tags = [...this.state.tags, tag]
    , showTags = !!tags.length

    this.setState({ tags, showTags })
    this.tagsChanged()
  }

  tagRemoved = tag => {
    let tags = this.state.tags.filter(curr => curr.id !== tag.id)
    , showAttr = !!tags.length

    this.setState({ showAttr, tags })
    this.tagsChanged()
  }

  tagsChanged = () => {
    if(this.state.tags.length && this.state.ml){
      l("Call ML with list of tags if ML on")
      this.http
      .post('/api/v1/get_attraction_for_tags', { tags_ids: this.state.tags.map(x => x.id) })
      .then(res => {
        l(res.data)
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
    l(params)
    this.http
    .get('/api/v1/undo', params)
    .then(res => {
      l(res)
      this.setState({
        showNotif: true, 
        notifType: "undo"
      })
      setTimeout(() => {
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
      this.setState({ 
        showAttr: false,
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
      l(request)
  
      this.http
      .post('/api/v1/send_attraction_for_tags', request)
      .then(res => {
        l(res.data)
        //  Show notif, undo
        this.getSuggTags()
        this.setState({ 
          showNotif: true, 
          lastTagId: res.data.id 
        })
        setTimeout(() => {
          this.setState({ 
            showAttr: false,
            att: {
              manual: 0,
              auto: 0
            }
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

  render() {
    return (
      <div className="block-content">
        <div className="title row">
          <div className="col-lg-6">
            Create new tag block   
          </div>
          <div className="col-lg-6 text-right">
            <span className="random-txt">Random Mode</span>
            <Switch
              checked={this.state.randomMode}
              onChange={this.toggleRandom}
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
        </div>
        <div className={this.state.showNotif?"shown notif":"notif"}>
          {
            this.state.notifType === "submit" &&
            <div>
              <div className="n-title">New tag block created!</div>
              <div onClick={this.undo} className="undo float-right">Undo</div>
              <div className="n-body">
                Tags: {this.state.tagsText}
                <br/>
                Attraction: {this.state.att.manual}
              </div>
            </div>
          }{
            this.state.notifType === "undo" &&
            <div>
              <div className="n-title">Tag block deleted successfully!</div>
              <div onClick={this.onUndo} className="undo float-left">Ok</div>    
            </div>
          }
        </div>
        <div className="body row">
          <div className="col-lg-7">
            {this.state.bots.length > 0 &&
            <div className="b-section">
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
                {this.state.bots.map(function(bot, idx){
                  return (
                    <option key={bot.id} value={bot.id}>{bot.name}</option>
                  )
                })}
              </select>
            </div>}            
            <div className="b-section">
              <div className="mb-2">
                {this.state.showTags && 
                <TagsComponent
                  type="default"
                  tags={this.state.tags}
                  removeTag={this.tagRemoved}
                />}
              </div>
              <AutoCompleteComponent 
                inputProps={{
                  className: 'tag-inp form-control',
                  placeholder: 'Add tag ..',
                }}
                type="tag"
                parent="tag"
                changeInput={this.inputChanged}
                optionSelected={this.tagAdded}
              />
            </div>
              {/* ShowAnim: <pre>{JSON.stringify(this.state.showAnim, null, 2)}</pre> */}
              {/* ShowAttr: <pre>{JSON.stringify(this.state.showAttr, null, 2)}</pre> */}
            <div className="b-section">
              {
                this.state.showAnim &&
                <div className="ctn-anim">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              }{
                this.state.showAttr &&
                <SliderComponent att={this.state.att} changeAtt={this.attChanged}/>
              }
            </div>
            <div className="b-section">
              <div className="custom-control custom-checkbox">
                <input checked={this.state.ml?"checked":""} onChange={this.mlChanged} type="checkbox" className="custom-control-input" id={checkId} />
                <label className="custom-control-label" htmlFor={checkId}>Turn On ML</label>
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="b-section mt-0">
              {this.state.showSugTags && 
              <div>
                <div className="sl-title">
                  <div>
                    Suggested Tags&nbsp;&nbsp;
                    {!this.state.toggleSugTags && 
                      <FontAwesomeIcon 
                        style={{ cursor: "pointer", fontSize: 22 }}
                        icon={faPlusSquare} 
                        onClick={() => this.setState({ 
                          toggleSugTags: !this.state.toggleSugTags
                        })}
                      />}
                    {this.state.toggleSugTags && 
                      <FontAwesomeIcon 
                        style={{ cursor: "pointer", fontSize: 22 }}
                        icon={faMinusSquare} 
                        onClick={() => this.setState({ 
                          toggleSugTags: !this.state.toggleSugTags
                        })}
                    />}
                  </div>
                </div>
                {this.state.toggleSugTags &&
                <TagsComponent
                  type="suggested"
                  tags={this.state.suggTags}
                  clickedTag={this.tagSuggested}
                />}
              </div>}
            </div>
            <div className="b-section">
              <button onClick={this.submit} className="btn btn-accent">Submit</button>
              <button onClick={this.nextBlock} className="ml-2 btn btn-accent-outline">Next Block</button>
            </div>
          </div>
        </div>            
      </div>
    )
  }
}