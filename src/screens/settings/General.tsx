import * as React from 'react';
import { ScrollView } from 'react-native';
import { observer } from 'mobx-react';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import { theme, applyThemeOptions } from 'styles';
import UI from 'stores/UI';
import { autobind } from 'core-decorators';
import { Navigation } from 'react-native-navigation';
const styles = theme(require('./Settings.styl'));

interface Props {
  componentId?: string;
  testID?: string;
}

@observer
export default class SettingsGeneralScreen extends React.Component<Props> {

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: 'General',
        },
      },
    });
  }

  componentDidAppear() {
    this.updateOptions();
    UI.updateCache();
  }

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, SettingsGeneralScreen.options);
  }

  render() {
    const { testID } = this.props;

    return (
      <ScrollView style={styles.host} contentContainerStyle={styles.host__container} testID={testID}>
        <CellGroup header="General">
          <Cell title="Default Stories to Load" />
          <Cell title="3D Touch Marks Stories Read" />
          <Cell title="Open YouTube links in YouTube app" />
          <Cell title="Hide bars on Scroll" />
        </CellGroup>
        <CellGroup header="Comments">
          <Cell title="Tap to Collapse" />
          <Cell title="Enable Actions on Swipe" />
        </CellGroup>
        <CellGroup header="Browser">
          <Cell title="Always Use Reader Mode" />
          <Cell title="Open links in" />
        </CellGroup>
        <CellGroup header="Cache">
          <Cell
            title="Clear cache"
            value={UI.cacheSize}
            onPress={UI.clearCache}
          />
        </CellGroup>
      </ScrollView>
    );
  }
}
