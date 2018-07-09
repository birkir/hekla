import * as React from 'react';
import { ScrollView } from 'react-native';
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import { Navigation } from 'react-native-navigation';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import UI from 'stores/UI';
import { themes } from 'stores/models/Theme';
import { theme, applyThemeOptions } from 'styles';
const styles = theme(require('./Settings.styl'));

interface Props {
  componentId?: string;
  testID?: string;
}

@observer
export default class SettingsThemeScreen extends React.Component<Props> {

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: 'Theme',
        },
      },
    });
  }

  componentDidAppear() {
    this.updateOptions();
  }

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, SettingsThemeScreen.options);
  }

  @autobind
  onThemeChange(e, { id }) {
    UI.settings.setValue('appearance.theme', id);
  }

  render() {
    const { testID } = this.props;
    return (
      <ScrollView style={styles.host} contentContainerStyle={styles.host__container} testID={testID}>
        <CellGroup header="Font family">
          <Cell
            title="Headings"
            value="San Francisco"
          />
          <Cell
            title="Body"
            value="San Francisco"
          />
        </CellGroup>
        <CellGroup header="Theme">
          {(Object as any).entries(themes).map(([key, value]) => (
            <Cell
              key={key}
              id={key}
              title={value}
              onPress={this.onThemeChange}
              selected={UI.settings.appearance.theme === key}
            />
          ))}
        </CellGroup>
      </ScrollView>
    );
  }
}
