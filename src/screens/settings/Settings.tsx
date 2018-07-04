import * as React from 'react';
import { ScrollView, Platform, Switch } from 'react-native';
import { observer } from 'mobx-react';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import CellIcon from 'components/cell/CellIcon';
import UI from 'stores/UI';
import CodePushStore from 'stores/CodePush';
import { SETTINGS_GENERAL_SCREEN, SETTINGS_APPEARANCE_SCREEN } from 'screens';
import { theme, applyThemeOptions } from 'styles';
import { Navigation } from 'react-native-navigation';
import { autobind } from 'core-decorators';
import CodePush from 'react-native-code-push';
import codePushConfig from 'utils/codePushConfig';
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
    });
  }

  componentDidAppear() {
    this.updateOptions();
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

  @autobind
  onBetaChange(flag: boolean) {
    // TODO: Prompt user to confirm and that the app will likely restart.
    UI.settings.setIsBeta(flag);
    const config = codePushConfig();
    config.installMode = CodePush.InstallMode.IMMEDIATE;
    CodePush.sync(config);
    console.log(config);
    // CodePush.restartApp(); // ?
  }

  render() {
    const { testID } = this.props;

    return (
      <ScrollView style={styles.host} contentContainerStyle={styles.host__container} testID={testID}>
        <CellGroup footer={true}>
          <Cell
            // left={<CellIcon source={require('assets/icons/32/reply.png')} backgroundColor="red" tintColor="white" />}
            title="General"
            onPress={this.onGeneralPress}
            more={true}
          />
          <Cell
            // left={<CellIcon source={require('assets/icons/32/reply.png')} backgroundColor="red" tintColor="white" />}
            title="Appearance"
            onPress={this.onAppearancePress}
            more={true}
          />
        </CellGroup>
        <CellGroup header={true}>
          <Cell title="About" />
          <Cell title="Donate" />
          <Cell title="Rate Hekla" />
        </CellGroup>
        <CellGroup header={true}>
          <Cell
            title="Version"
            value={CodePushStore.version}
          />
          {CodePushStore.updateMetadata && (
            <Cell
              title="Description"
              value={CodePushStore.updateMetadata.description}
            />
          )}
          {Platform.OS === 'android' ? (
            <Cell
              title="Opt-in to Beta"
              value={(
                <Switch
                  value={UI.settings.isBeta}
                  onValueChange={this.onBetaChange}
                />
              )}
            />
          ) : (
            <Cell
              title="Beta"
              value={UI.settings.isBeta ? 'Yes' : 'No'}
            />
          )}
          <Cell
            title="Get CodePush metadata"
            onPress={CodePushStore.update}
          />
        </CellGroup>
      </ScrollView>
    );
  }
}
