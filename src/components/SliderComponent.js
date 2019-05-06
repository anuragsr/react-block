import React, { Component } from 'react'
import { Slider, Rail, Handles, Tracks } from 'react-compound-slider'

import { l } from '../helpers/common'

const Track = ({ source, target, getTrackProps }) => { // Track component

  const getStyle = source => {
    let ret = {}
    if(source.id === '$$-0'){
      if(source.value < 0){
        ret.left = `${source.percent}%`
        ret.width = `${50 - source.percent}%`
        ret.backgroundColor = '#ff4c43'
      } else{
        ret.left = `${50}%`
        ret.width = `${source.percent - 50}%`
        ret.backgroundColor = '#56d86c'
      }
    }
    return ret
  }

  return (
    <div 
      className="slider-track"
      style={getStyle(source)}
      {...getTrackProps()}
    />
  )
}

const Handle = ({ handle: { id, percent }, getHandleProps }) => { // Handle component
  return (
    <div
      className="slider-handle"
      style={{ left: `${percent}%` }}
      {...getHandleProps(id)}
    />
  )
}

let rangeValues = [0]

export default class SliderComponentNew extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      att: this.props.att
    }
  }
  
  componentWillReceiveProps = nextProps => {
    // l("Attraction", nextProps)
    rangeValues = [nextProps.att.manual]
    this.setState({ att: nextProps.att })
  }

  onManualChange = e => {
    let val = parseInt(e.target.value)

    this.setState( state => ({
      att: {
        ...state.att,
        manual: val
      }
    }), this.props.changeAtt(val))    
  }

  onSliderChange = value => {
    this.setState( state => ({
      att: {
        ...state.att,
        manual: value[0]
      }
    }), this.props.changeAtt(value[0]))
  }

  resetAttr = () => this.onSliderChange([this.state.att.auto])

  render() {
    const attResetDisabled = this.state.att.manual === this.state.att.auto

    return (
      <div>
        <div className="sl-title">
          <div>Attraction</div>
          <input 
            type="number" 
            min={-100} max={100} 
            className="att-inp form-control" 
            value={Number(this.state.att.manual).toString()} 
            onChange={this.onManualChange} 
          />
        </div>
        <Slider
          className="slider-outer"
          domain={[-100, 100]}
          step={1}
          mode={1}
          values={rangeValues}
          onUpdate={this.onSliderChange}
        >
          <Rail>
            {({ getRailProps }) => (  // adding the rail props sets up events on the rail
              <div className="slider-rail" {...getRailProps()}/>              
            )}
          </Rail>
          <Handles>
            {({ handles, getHandleProps }) => (
              <div className="slider-handles">
                {handles.map(handle => (
                  <Handle
                    key={handle.id}
                    handle={handle}
                    getHandleProps={getHandleProps}
                  />
                ))}
              </div>
            )}
          </Handles>
          <Tracks>
            {({ tracks, getTrackProps  }) => (
              <div className="slider-tracks">
                {tracks.map(({ id, source, target }) => (
                  <Track
                    key={id}
                    source={source}
                    target={target}
                    getTrackProps ={getTrackProps}                    
                  />
                ))}
              </div>
            )}
          </Tracks>
          <div className="slider-separator"></div>
        </Slider>
        <button className="btn-reset" disabled={attResetDisabled} onClick={this.resetAttr}>
          <img src="assets/rotate-ccw.svg" style={{ opacity: attResetDisabled ? .6 : 1 }} alt=""/>
        </button>
      </div>
    )
  }
}