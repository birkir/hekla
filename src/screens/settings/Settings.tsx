import * as React from 'react';
import { ScrollView } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import Rate, { AndroidMarket } from 'react-native-rate';
import CodePush from 'react-native-code-push';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import CellIcon from 'components/cell/CellIcon';
import UI from 'stores/UI';
import codePushConfig from 'utils/codePushConfig';
import { SETTINGS_GENERAL_SCREEN, SETTINGS_APPEARANCE_SCREEN, SETTINGS_THEME_SCREEN, SETTINGS_DONATE_SCREEN, SETTINGS_ABOUT_SCREEN } from 'screens';
import { theme, applyThemeOptions } from 'styles';
import config from 'config';
const styles = theme(require('./Settings.styl'));

interface Props {
  componentId: string;
  testID?: string;
}

@CodePush(codePushConfig())
@observer
export default class SettingsScreen extends React.Component<Props> {

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: 'Settings',
        },
      },
      bottomTab: {
        text: 'Settings',
        testID: 'SETTINGS_TAB',
        icon: require('assets/icons/25/settings.png'),
      },
    });
  }

  componentWillMount() {
    UI.addScreen(this);
  }

  componentWillUnmount() {
    UI.removeScreen(this);
  }

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, SettingsScreen.options);
  }

  onGeneralPress() {
    Navigation.push(UI.componentId, {
      component: {
        name: SETTINGS_GENERAL_SCREEN,
      },
    });
  }

  onAppearancePress() {
    Navigation.push(UI.componentId, {
      component: {
        name: SETTINGS_APPEARANCE_SCREEN,
      },
    });
  }

  onThemePress() {
    Navigation.push(UI.componentId, {
      component: {
        name: SETTINGS_THEME_SCREEN,
      },
    });
  }

  onAboutPress() {
    Navigation.push(UI.componentId, {
      component: {
        name: SETTINGS_ABOUT_SCREEN,
      },
    });
  }

  onRatePress() {
    const options = {
      AppleAppID: config.IOS_APPSTORE_ID,
      GooglePackageName: config.ANDROID_BUNDLE_ID,
      preferredAndroidMarket: AndroidMarket.Google,
      preferInApp: false,
    };

    Rate.rate(options, () => null);
  }

  onDonatePress() {
    Navigation.push(UI.componentId, {
      component: {
        name: SETTINGS_DONATE_SCREEN,
      },
    });
  }

  render() {
    const { testID } = this.props;

    return (
      <ScrollView style={styles.host} contentContainerStyle={styles.host__container} testID={testID}>
        <CellGroup footer={true}>
          <Cell
            left={<CellIcon
              source={require('assets/icons/32/settings.png')}
              size={26}
              backgroundColor="#8e8e93"
            />}
            title="General"
            onPress={this.onGeneralPress}
            more={true}
          />
          <Cell
            left={<CellIcon
              backgroundColor="#157dfa"
              source={require('assets/icons/32/font-size-filled.png')}
              size={19}
            />}
            title="Appearance"
            onPress={this.onAppearancePress}
            more={true}
          />
          <Cell
            left={<CellIcon
              backgroundColor="#5e5fe3"
              source={require('assets/icons/32/paint-palette-filled.png')}
              size={19}
            />}
            title="Theme"
            onPress={this.onThemePress}
            more={true}
          />
        </CellGroup>
        <CellGroup header={true}>
          <Cell
            title="About"
            left={<CellIcon
              backgroundColor="#157dfa"
              source={require('assets/icons/32/email-filled.png')}
              size={20}
            />}
            more={true}
            onPress={this.onAboutPress}
          />
          <Cell
            title="Donate"
            left={<CellIcon
              source={require('assets/icons/32/beer.png')}
              backgroundColor="#42d855"
              size={22}
            />}
            onPress={this.onDonatePress}
            more={true}
          />
          <Cell
            title="Rate"
            left={<CellIcon
              source={require('assets/icons/32/heart.png')}
              backgroundColor="#fc3259"
              size={22}
            />}
            onPress={this.onRatePress}
          />
        </CellGroup>
      </ScrollView>
    );
  }
}
