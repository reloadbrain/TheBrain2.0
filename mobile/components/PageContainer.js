import React from 'react'

import { View, BackHandler, Platform } from 'react-native'
import Header from './Header'
import MainMenu from './MainMenu'
import { withRouter } from 'react-router'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { connect } from 'react-redux'
import { compose } from 'react-apollo'
import * as mainMenuActions from '../actions/MainMenuActions'

class PageContainer extends React.Component {
  componentDidMount = () => {
    BackHandler.addEventListener('hardwareBackPress', this.handleBack)
  }

  componentWillUnmount = () => {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBack)
  }

  handleBack = () => {
    if (this.props.mainMenu.visible) {
      this.props.dispatch(mainMenuActions.updateMainMenuVisibility({
        visible: false
      }))
      return true
    }
    const { history } = this.props
    if (history.index === 0) {
      BackHandler.exitApp()
      return true
    } else {
      history.goBack()
      return true
    }
  }

  changeSafeAreaViewBackground () {
    return this.props.changeSafeAreaViewBackground || this.props.location.state.changeSafeAreaViewBackground
  }

  renderMainMenu = () => {
    return this.props.mainMenu.visible ? <MainMenu changeSafeAreaViewBackground={this.changeSafeAreaViewBackground()} /> : this.props.children
  }

  renderContainer = () => (
    <View style={{ height: '100%', backgroundColor: 'white' }}>
      <Header />
      {this.renderMainMenu()}
    </View>)

  renderKeyboardAwareContainer = () => (
    <KeyboardAwareScrollView style={{
      height: '100%',
      backgroundColor: 'white'
    }}>
      <View style={{
        height: '100%'
      }}>
        <Header hideHamburger={this.props.hideHamburger} />
        {this.renderMainMenu()}
      </View>
    </KeyboardAwareScrollView>)

  render () {
    return this.props.dontUseKeyboarAware || Platform.OS === 'android' ? this.renderContainer() : this.renderKeyboardAwareContainer()
  }
}

export default compose(
  connect(state => state),
  withRouter
)(PageContainer)
