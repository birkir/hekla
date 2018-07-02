import * as React from 'react';
import { ScrollView } from 'react-native';
import { observer } from 'mobx-react';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import CellIcon from 'components/cell/CellIcon';
import UI from 'stores/UI';
import { SETTINGS_GENERAL_SCREEN, SETTINGS_APPEARANCE_SCREEN } from 'screens';
import { theme, applyThemeOptions } from 'styles';
import { Navigation } from 'react-native-navigation';
import { autobind } from 'core-decorators';
const styles = theme(require('./Settings.styl'));

interface Props {
  componentId: string;
  testID?: string;
}

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
      </ScrollView>
    );
  }
}
