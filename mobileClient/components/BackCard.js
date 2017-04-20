import React from 'react';
import {connect} from 'react-redux';
import {
  Text,
  View,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Emoji from 'react-native-emoji';
import styles from '../styles/styles';
import { updateAnswerVisibility } from '../actions/FlashcardActions';

const DIRECTION = {
  LEFT: 1,
  UP: 2,
  RIGHT: 3,
  DOWN: 4,
};

class BackCard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0,
    };
    this.toAnswerSide = 180;
    this.toQuestionSide = 0;
    this.backInterpolate = props.interpolateCb({
      inputRange: [0, 180],
      outputRange: ['180deg', '360deg'],
    })
  }

  onSubmitEvaluation = (value) => {
    this.props.submitCb({
      itemId: this.props.evalItemId,
      evaluation: value
    });
    this.props.dispatch(updateAnswerVisibility(false));
    this.props.flipCardCb();
  };

  calculateSwipeDirection = (x, y) => {
    const angleDeg = Math.atan2(y - 0, x - 0) * 180 / Math.PI;
    return (Math.round(angleDeg / 90) + 2) % 4 + 1;
  };

  isDragLongEnough = () => {
    const dragLen = this.calculateDragLength(this.state.x, this.state.y);
    return dragLen > 100;
  };

  resetPosition = (e) => {
    const direction = this.calculateSwipeDirection(this.state.x, this.state.y);
    if (this.isDragLongEnough()) {
      this.onSubmitEvaluation(direction);
    }
    this.dragging = false;
    //Reset on release
    this.setState({
      x: 0,
      y: 0,
    })

  };
  _onStartShouldSetResponder = (e) => {
    this.dragging = true;
    //Setup initial drag coordinates
    this.drag = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY
    };
    return true;
  };
  _onMoveShouldSetResponder = (e) => {
    return true;
  };

  calculateDragLength = (x, y) => {
    return (y ^ 2 + x ^ 2) ^ -2;
  };

  setPosition = (event) => {
    //Update our state with the deltaX/deltaY of the movement
    this.setState({
      x: this.state.x + (event.nativeEvent.pageX - this.drag.x),
      y: this.state.y + (event.nativeEvent.pageY - this.drag.y)
    });

    //Set our drag to be the new position so our delta can be calculated next time correctly
    this.drag.x = event.nativeEvent.pageX;
    this.drag.y = event.nativeEvent.pageY;
  };

  getCardStyle = function () {
    const transform = [{rotateY: this.backInterpolate}, {translateX: this.state.x}, {translateY: this.state.y}];
    return {transform};
  };

  getMarkerStyle = () => {
    const dragLen = this.calculateDragLength(this.state.x, this.state.y);
    const alpha = dragLen / 100;
    const backgroundColor = `rgba(0, 255, 0, ${alpha});`;
    return {backgroundColor};
  };

  render = () => {
    return (
      <Animated.View style={[this.getCardStyle(), styles.flipCard, styles.flipCardBack]}>
        <Text style={[styles.upMarker, this.getMarkerStyle('up')]}><Emoji name="pensive"/>️</Text>
        <Text style={[styles.leftMarker, this.getMarkerStyle('left')]}><Emoji name="fearful"/></Text>
        <Text style={[styles.downMarker, this.getMarkerStyle('down')]}><Emoji name="innocent"/></Text>
        <Text style={[styles.rightMarker, this.getMarkerStyle('right')]}><Emoji name="smile"/></Text>
        { this.props.flashcard.visibleAnswer && <View onResponderMove={this.setPosition}
                                            onResponderRelease={this.resetPosition}
                                            onStartShouldSetResponder={this._onStartShouldSetResponder}
                                            onMoveShouldSetResponder={this._onMoveShouldSetResponder}>
          <Text style={styles.primaryHeader}>CORRECT ANSWER:</Text>
          <Text style={[styles.primaryText, styles.flipCardContent]}>{this.props.answer}</Text>
          <Text style={styles.primaryHeader}>How would you describe experience answering this
            question?</Text>
        </View> }
      </Animated.View>
    )
  }
}

export default connect(state => state)(BackCard);
