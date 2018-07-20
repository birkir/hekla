import * as React from 'react';
import { ScrollView, Text, Switch } from 'react-native';
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import { Navigation } from 'react-native-navigation';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import SliderFontSize from 'components/slider-font-size/SliderFontSize';
import UI from 'stores/UI';
import { themes } from 'stores/enums/Theme';
import { theme, applyThemeOptions } from 'styles';
import { formatFont, font } from 'stores/enums/Font';
import openActionSheet from 'utils/openActionSheet';
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

  componentWillMount() {
    UI.addScreen(this);
  }

  componentWillUnmount() {
    UI.removeScreen(this);
  }

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, SettingsThemeScreen.options);
  }

  @autobind
  onThemeChange(e, { id }) {
    UI.settings.setValue('appearance.theme', id);
    UI.updateScreens();
  }

  onFontFamilyBodyPress() {
    const options = (Object as any).entries(font).map(([id, title]) => ({ id, title }));

    openActionSheet({ options, title: 'Body Font', cancel: 'Cancel', selectedId: UI.settings.appearance.fontFamilyBody }, ({ id }) => {
      UI.settings.setValue('appearance.fontFamilyBody', id);
    });
  }

  onSystemTextSizeChange(flag: boolean) {
    UI.settings.setValue('appearance.useSystemFontSize', flag);
  }

  onFontSizeChange(size) {
    UI.settings.setValue('appearance.fontSize', size);
  }

  render() {
    const { testID } = this.props;
    return (
      <ScrollView style={styles.host} contentContainerStyle={styles.host__container} testID={testID}>
        <CellGroup header="Typography">
          <Cell
            title="Font family"
            value={(
              <Text style={[{ fontFamily: UI.settings.appearance.fontFamilyBody }, styles.fontFamilyValue]}>{formatFont(UI.settings.appearance.fontFamilyBody)}</Text>
            )}
            onPress={this.onFontFamilyBodyPress}
          />
          <Cell
            title="Use System Text Size"
            value={(
              <Switch
                value={UI.settings.appearance.useSystemFontSize}
                onValueChange={this.onSystemTextSizeChange}
              />
            )}
          />
          <Cell
            value={(
              <SliderFontSize
                value={UI.settings.appearance.fontSize}
                onValueChange={this.onFontSizeChange}
                disabled={UI.settings.appearance.useSystemFontSize}
              />
            )}
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
