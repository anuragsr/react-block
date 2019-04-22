import React, { Component } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import { l } from '../helpers/common'

const Range = Slider.Range
const handleStyles = {
  transparent: {
    height: 0,
    width: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  visible: {
    height: 20,
    width: 20,
    marginLeft: -10,
    marginTop: -7,
    borderColor: '#1785fb',
    backgroundColor: '#1785fb',
  }
}

let rangeValue = [0, 0]
, handleStyle = [handleStyles.transparent, handleStyles.visible]

export default class SliderComponent extends Component {
  constructor(props) {    
    super(props)
    this.state = { 
      att: this.props.att,
      bg: '#ff4c43'
    }
  }
  
  componentWillReceiveProps = nextProps => {
    // l("Attraction", nextProps)
    let val = nextProps.att.manual
    if(val >= 0) rangeValue = [0, val]
    else rangeValue = [val, 0]
    this.setState({ att: nextProps.att })
  }

  onManualChange = e => {
    let val = parseInt(e.target.value), bg

    if (val >= 0) { // Positive
      bg = '#56d86c'
      rangeValue = [0, val]
      handleStyle = [handleStyles.transparent, handleStyles.visible]
    } else {      
      bg = '#ff4c43'
      rangeValue = [val, 0]
      handleStyle = [handleStyles.visible, handleStyles.transparent]
    }

    this.setState( state => ({
      att: {
        ...state.att,
        manual: val
      },
      bg
    }), this.props.changeAtt(val))    
  }

  onSliderChange = value => {
    let val, bg

    if(value[0] === 0){ // Positive
      val = value[1]
      bg = '#56d86c'
      rangeValue = [0, val]
      handleStyle = [handleStyles.transparent, handleStyles.visible]
    } else {
      val = value[0]
      bg = '#ff4c43'
      rangeValue = [val, 0]
      handleStyle = [handleStyles.visible, handleStyles.transparent]      
    }

    this.setState( state => ({
      att: {
        ...state.att,
        manual: val
      },
      bg
    }), this.props.changeAtt(val))    
  }

  resetAttr = () => {
    if (this.state.att.auto > 0)
      this.onSliderChange([0, this.state.att.auto])
    else
      this.onSliderChange([this.state.att.auto, 0])
  }

  render() {
    const styles = {
      trackStyle: [{ backgroundColor: this.state.bg, height: 5 }],
      handleStyle
    }

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
        <Range
          min={-100}
          max={100}
          value={rangeValue}          
          onChange={this.onSliderChange}
          trackStyle={styles.trackStyle}
          handleStyle={styles.handleStyle}
        />
        <button className="btn-reset" disabled={attResetDisabled} onClick={this.resetAttr}>
          <img src="assets/rotate-ccw.svg" style={{ opacity: attResetDisabled ? .6 : 1 }} alt=""/>
        </button>
      </div>
    )
  }
}