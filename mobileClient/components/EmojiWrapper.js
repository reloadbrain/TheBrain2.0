import React from 'react';
import {
    Text,
} from 'react-native';
import Emoji from 'react-native-emoji';
import styles from '../styles/styles';

const DIRECTION = {
    1: 'left',
    2: 'top',
    3: 'right',
    4: 'bottom',
};

export default class EmojiWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.direction = {};
        this.directionSettings = {
            right: {
                emojiDescription: 'Good',
                emoji: 'smile',
                emojiStyle: styles.rightMarker,
                padding: -20
            },
            left: {
                emojiDescription: 'Bad',
                emoji: 'fearful',
                emojiStyle: styles.leftMarker,
                padding: -15
            },
            top: {
                emojiDescription: 'Unsure',
                emoji: 'pensive',
                emojiStyle: styles.upMarker,
                padding: -5
            },
            bottom: {
                emojiDescription: 'Almost',
                emoji: 'innocent',
                emojiStyle: styles.downMarker,
                padding: 90
            },
        }
    }

    getMarkerStyleForVertical = (directionName, markerStyle, padding, dragFactor) => {
        const leftPadding = 12;
        const widthCenter = (this.props.windowDimensions.width / 2) - this.markerWidth + leftPadding;
        return {
            ...markerStyle,
            [directionName]: ((this.markerHeight / 2) * dragFactor) + padding,
            left: widthCenter,
        }
    };

    getMarkerStyleForHorizontal = (directionName, markerStyle, padding, dragFactor) => {
        const topPadding = -30;
        const heightCenter = (this.props.windowDimensions.height / 2) - this.markerHeight + topPadding;
        return {
            ...markerStyle,
            [directionName]: ((this.markerWidth / 2) * dragFactor) + padding,
            top: heightCenter,
        }
    };

    getMarkerStyle = () => {
        const directionName = DIRECTION[this.props.swipeDirection];
        const dragFactor = this.props.dragLen / 100;

        let markerStyle = {
            opacity: dragFactor * 2, transform: [{scale: dragFactor}],
        };

        this.direction = this.directionSettings[directionName];
        if (directionName === 'left' || directionName === 'right') {
            return this.getMarkerStyleForHorizontal(directionName, markerStyle, this.directionSettings[directionName].padding, dragFactor);
        }
        return this.getMarkerStyleForVertical(directionName, markerStyle, this.directionSettings[directionName].padding, dragFactor);
    };


    measureMarker = (event) => {
        this.markerWidth = event.nativeEvent.layout.width;
        this.markerHeight = event.nativeEvent.layout.height;
    };

    render = () => {
        return (
            <Text style={[styles.baseMarkerStyle, this.direction.emojiStyle, this.getMarkerStyle()]}
                  onLayout={(event) => this.measureMarker(event)}>
                <Emoji name={this.direction.emoji}/>{this.direction.emojiDescription}
            </Text>
        )
    }
}