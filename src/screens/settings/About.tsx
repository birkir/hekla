import * as React from 'react';
import { ScrollView, Platform, Switch, Alert } from 'react-native';
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import { Navigation } from 'react-native-navigation';
import VersionNumber from 'react-native-version-number';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import UI from 'stores/UI';
import { theme, applyThemeOptions } from 'styles';
import CodePushStore from 'stores/CodePush';
import codePushConfig from 'utils/codePushConfig';
import CodePush, { DownloadProgress, RemotePackage } from 'react-native-code-push';
import { observable } from 'mobx';
import CellIcon from 'components/cell/CellIcon';
const styles = theme(require('./Settings.styl'));

interface Props {
  componentId?: string;
  testID?: string;
}

@observer
export default class SettingsAboutScreen extends React.Component<Props> {

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: 'About',
        },
      },
    });
  }

  componentDidAppear() {
    this.updateOptions();
    UI.updateCache();
  }

  @observable
  progress;

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, SettingsAboutScreen.options);
  }

  onGitHubProjectPress() {
    UI.openURL('https://github.com/birkir/hekla');
  }

  onTwitterPress() {
    UI.openURL('https://twitter.com/birkirgudjonson');
  }

  onGitHubBirkirPress() {
    UI.openURL('https://github.com/birkir');
  }

  onPrivacyPolicyPress() {
    UI.openURL('https://github.com/birkir/hekla/blob/master/PRIVACY_POLICY.md');
  }

  onCreditsPress() {
    UI.openURL('https://github.com/birkir/hekla/blob/master/CREDITS.md');
  }

  @autobind
  onBetaChange(flag: boolean) {
    // TODO: Prompt user to confirm and that the app will likely restart.
    UI.settings.setValue('isBeta', flag);
    const config = codePushConfig();
    config.installMode = CodePush.InstallMode.IMMEDIATE;
    CodePush.sync(config);
  }

  @autobind
  onDownloadProgress({ totalBytes, receivedBytes }: DownloadProgress) {
    this.progress = receivedBytes / totalBytes;
  }

  @autobind
  onBinaryVersionMismatch(update: RemotePackage) {
    Alert.alert('New version available in AppStore');
  }

  @autobind
  async onCodePushPress() {
    const config = codePushConfig();
    config.installMode = CodePush.InstallMode.IMMEDIATE;
    const update = await CodePush.sync(config, null, this.onDownloadProgress, this.onBinaryVersionMismatch);

    switch (update) {
      case CodePush.SyncStatus.UP_TO_DATE:
        Alert.alert('No update available');
        break;
      case CodePush.SyncStatus.UNKNOWN_ERROR:
        Alert.alert('Unknown error');
        break;
    }
  }

  render() {
    const { testID } = this.props;
    return (
      <ScrollView style={styles.host} contentContainerStyle={styles.host__container} testID={testID}>
        <CellGroup>
          <Cell
            left={<CellIcon
              source={require('assets/icons/32/github-filled.png')}
              backgroundColor="#a1a2a3"
              size={22}
            />}
            title="Hekla on GitHub"
            onPress={this.onGitHubProjectPress}
            more={true}
          />
          <Cell
            left={<CellIcon
              source={require('assets/icons/32/twitter-filled.png')}
              backgroundColor="#1da1f2"
              size={20}
            />}
            title="@birkirgudjonson"
            onPress={this.onTwitterPress}
            more={true}
          />
          <Cell
            left={<CellIcon
              source={require('assets/icons/32/github-filled.png')}
              backgroundColor="#a1a2a3"
              size={22}
            />}
            title="@birkir"
            onPress={this.onGitHubBirkirPress}
            more={true}
          />
          <Cell
            left={<CellIcon
              source={require('assets/icons/32/privacy-filled.png')}
              backgroundColor="rgb(88,86,214)"
              size={18}
            />}
            title="Privacy Policy"
            onPress={this.onPrivacyPolicyPress}
            more={true}
          />
          <Cell
            left={<CellIcon
              source={require('assets/icons/32/heart.png')}
              backgroundColor="rgb(76,217,100)"
              size={20}
            />}
            title="Credits"
            onPress={this.onCreditsPress}
            more={true}
          />
        </CellGroup>
        <CellGroup header={true}>
          <Cell
            title="Version"
            value={VersionNumber.appVersion || 'development'}
          />
          <Cell
            title="Build"
            value={VersionNumber.buildVersion || 'development'}
          />
          <Cell
            title="Update"
            subtitle={CodePushStore.description}
            value={CodePushStore.version}
            onPress={this.onCodePushPress}
          />
          {Platform.OS === 'android' && (
            <Cell
              title="Opt-in to Beta"
              value={<Switch value={UI.settings.isBeta} onValueChange={this.onBetaChange} />}
            />
          )}
          {Platform.OS === 'ios' && UI.settings.isBeta && (
            <Cell
              title="Beta"
              value="Yes"
            />
          )}
        </CellGroup>
      </ScrollView>
    );
  }
}
