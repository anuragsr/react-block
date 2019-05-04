import React, { Component } from 'react'
import { Slider, Handles, Tracks } from 'react-compound-slider'

import { l } from '../helpers/common'

const Track = ({ source, target }) => { // Track component
  return (
    <div
      className="slider-track"
      style={{
        left: `${source.percent}%`,
        width: `${target.percent - source.percent}%`,
        backgroundColor: source.id === '$$-0' ? '#56d86c' : '#ff4c43',
      }}
    />
  )
}

const Handle = ({ handle: { id, percent }, getHandleProps }) => { // Handle component
  return (
    <div
      className="slider-handle"
      style={{
        left: `${percent}%`,
        zIndex: id === '$$-0' ? -1 : 1,
        opacity: id === '$$-0' ? 0 : 1,        
      }}
      {...getHandleProps(id)}
    />
  )
}

let rangeValues = [0, 0]

export default class SliderComponentNew extends Component {
  constructor(props) {    
    super(props)
    this.state = { 
      att: this.props.att
    }
  }
  
  componentWillReceiveProps = nextProps => {
    // l("Attraction", nextProps)
    rangeValues = [0, nextProps.att.manual]
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
    // l(value)
    let val
    if (value[0] === 0) val = value[1] // Positive
    else val = value[0]

    this.setState( state => ({
      att: {
        ...state.att,
        manual: val
      }
    }), this.props.changeAtt(val))
  }

  resetAttr = () => {
    if (this.state.att.auto > 0)
      this.onSliderChange([0, this.state.att.auto])
    else
      this.onSliderChange([this.state.att.auto, 0])
  }

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
          <div className="slider-rail"/>
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
          <Tracks left={false} right={false}>
            {({ tracks }) => (
              <div className="slider-tracks">
                {tracks.map(({ id, source, target }) => (
                  <Track
                    key={id}
                    source={source}
                    target={target}
                  />
                ))}
              </div>
            )}
          </Tracks>
        </Slider>
        <button className="btn-reset" disabled={attResetDisabled} onClick={this.resetAttr}>
          <img src="assets/rotate-ccw.svg" style={{ opacity: attResetDisabled ? .6 : 1 }} alt=""/>
        </button>
      </div>
    )
  }
}