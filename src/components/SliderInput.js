import React, { Component } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRedo } from '@fortawesome/free-solid-svg-icons'

class SliderInput extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      att: this.props.att
    }
    this.onSliderChange = this.onSliderChange.bind(this)
    this.resetAttr = this.resetAttr.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ att: nextProps.att }) 
  }

  onSliderChange(value){
    this.setState( state => ({
      att: {
        ...state.att,
        manual: value
      }
    }))
    this.props.changeAtt(value)
  }

  resetAttr(){
    this.onSliderChange(this.state.att.auto)
  }

  render() {
    const styles = {
      trackStyle: { backgroundColor: '#5bb884', height: 5 },
      railStyle: { backgroundColor: '#e4fff3', height: 5 },
      handleStyle: {
        height: 20,
        width: 20,
        // marginLeft: this.state.value?-10:0,
        marginLeft: -10,
        marginTop: -7,
        borderColor: '#5bb884',
        backgroundColor: '#5bb884',
      }
    }

    return (
      <div>
        <div className="sl-title">
          <div>Attraction</div>
          <div>{this.state.att.manual}</div>       
        </div>
        <Slider
          value={this.state.att.manual}
          onChange={this.onSliderChange} 
          trackStyle={styles.trackStyle}
          railStyle={styles.railStyle}
          handleStyle={styles.handleStyle}
        />
        <button className="btn-reset" disabled={this.state.att.manual === this.state.att.auto} onClick={this.resetAttr}>
          <FontAwesomeIcon icon={faRedo} />
        </button>
      </div>
    )
  }
}

export default SliderInput