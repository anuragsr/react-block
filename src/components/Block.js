import React, { Component } from 'react'
import Switch from "react-switch"
import TagInput from './TagInput'
import SliderInput from './SliderInput'
import HttpService from '../services/HttpService'

class Block extends Component {
  
  constructor(props) {
    super(props)
    this.http = new HttpService()
    this.state = {
      show: this.props.show,
      showNotif: false, 
      showAnim: false,
      showAttr: false,
      bots: [],
      currBot: {},
      tags: [],
      ml: false,
      att: {
        manual: 0,
        auto: 0
      },
    }
    this.toggled = this.toggled.bind(this)
    this.inputChanged = this.inputChanged.bind(this)
    this.botChanged = this.botChanged.bind(this)
    this.mlChanged = this.mlChanged.bind(this)
    this.attChanged = this.attChanged.bind(this)
    this.tagsChanged = this.tagsChanged.bind(this)
    this.submit = this.submit.bind(this)
    this.undo = this.undo.bind(this)
  }

  componentDidMount(){
    this.http
    .get('/api/v1/bots')
    .then(res => {
      let bots = res.data.results, currBot = bots[0]
      this.setState({ bots, currBot })
    })
  }
  
  toggled(show){
    this.setState({ show })
  }
  
  inputChanged(showAnim, showAttr){
    this.setState({ showAnim, showAttr })
  }
  
  botChanged(e){
    let currBot = this.state.bots.filter(bot => { return bot.id === parseInt(e.target.value) })[0]
    this.setState({ currBot })
  }
  
  mlChanged(e){    
    let ml = e.target.checked
    this.setState({ ml })
  } 
  
  tagsChanged(tags){
    if(tags.length && this.state.ml){
      // console.log(tags)
      console.log("Call ML with list of tags if ML on")
      this.http
      .post('/api/v1/get_attraction_for_tags', { "tags_ids": tags.map(x => x.id) })
      .then(res => {
        console.log(res.data)
        let attr = res.data.attraction?res.data.attraction:0
        this.setState( state => ({
          att: {
            ...state.att,
            manual: attr,
            auto: attr
          }
        }))
      })      
    }
    this.setState({ tags })
  }
  
  attChanged(val){
    this.setState( state => ({
      att: {
        ...state.att,
        manual: val
      }
    }))
  }

  undo(){
    this.http
    .get('/api/v1/undo', { 
      params: { type: 'tag', id: 1 }
    })
    .then(res => {
      alert("Undo status:" + res.status)
    })
  }

  submit(){
    // console.log(this.state)
    if(this.state.tags.length){
      const request = {
        "tags_ids": this.state.tags.map(x => x.id),
        "ML_attraction": this.state.ml?this.state.att.auto:"None",
        "editor_attraction": this.state.att.manual, 
        "editor_id": 1
      }
      console.log(request)
  
      this.http
      .post('/api/v1/send_attraction_for_tags', request)
      .then(res => {
        console.log(res.data)
        //  Show notif, undo
        this.setState({ showNotif: true })
        setTimeout(() => {
          this.setState({ showNotif: false, tags: [], showAttr: false })
        }, 5000)
      })    
    }
  }

  render() {
    return (
      <div className="m-4 block">
        <div className="block-title">
          <div>{this.props.type} Block</div>
          <div>
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
        </div>
        {
          this.state.show && 
          <div className="block-content">
            <div className="title">
              {this.props.type === "Photo" && "Photo Block content here"}
              {this.props.type === "Place" && "Place Block content here"}            
              {this.props.type === "Tag" && "Create new tag block"}            
            </div>
            {
              <div className={this.state.showNotif?"shown notif":"notif"}>
                <div className="n-title">New tag block created!</div>
                <div onClick={this.undo} className="undo float-right">Undo</div>
                <div className="n-body">
                  Tags: {this.state.tags.length?
                    this.state.tags.map((t, i) => {
                      if(i === this.state.tags.length - 1)
                        return "#" + t.name
                      else
                        return "#" + t.name + ", "
                    }
                    ):"None"}
                  <br/>
                  Attraction: {this.state.att.manual}
                </div>
              </div>
            }
            {
              this.props.type === "Photo" &&
              <div className="body row">
                <div className="col-lg-7">
                  This block is coming soon.                
                </div>
              </div>
            }{
              this.props.type === "Place" &&
              <div className="body row">
                <div className="col-lg-7">
                  This block is coming soon.
                </div>
              </div>
            }{
              this.props.type === "Tag" &&
              this.state.bots.length > 0 &&
              <div className="body row">
                <div className="col-lg-7">
                  <div className="b-section">
                    <img src={this.state.currBot.avatar} alt="bot" height="50" />
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
                  </div>
                  <div className="b-section">
                    <TagInput tags={this.state.tags} changeInput={this.inputChanged} changeTags={this.tagsChanged}/>
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
                      <SliderInput att={this.state.att} changeAtt={this.attChanged}/>
                    }
                  </div>
                  <div className="b-section">
                    <div className="custom-control custom-checkbox">
                      <input checked={this.state.ml?"checked":""} onChange={this.mlChanged} type="checkbox" className="custom-control-input" id="customCheck1" />
                      <label className="custom-control-label" htmlFor="customCheck1">Turn On ML</label>
                    </div>
                  </div>
                  <div className="b-section">
                    <button onClick={this.submit} className="btn btn-accent">Submit</button>
                  </div>
                </div>
              </div>    
            }
          </div>
        }
      </div>      
    );
  }
}

export default Block
