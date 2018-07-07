import * as React from 'react';
import { ScrollView, Switch, LayoutAnimation } from 'react-native';
import { observer } from 'mobx-react';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import SliderFontSize from 'components/slider-font-size/SliderFontSize';
import { autobind } from 'core-decorators';
import UI from 'stores/UI';
import { Navigation } from 'react-native-navigation';
import { theme, applyThemeOptions } from 'styles';
import { themes } from 'stores/models/Theme';
import openActionSheet from 'utils/openActionSheet';
const styles = theme(require('./Settings.styl'));

interface Props {
  componentId?: string;
  testID?: string;
}

const StorySizeLabel = {
  large: 'Large',
  compact: 'Compact',
};

@observer
export default class SettingsAppearanceScreen extends React.Component<Props> {

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: 'Appearance',
        },
      },
    });
  }

  componentDidAppear() {
    this.updateOptions();
  }

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, SettingsAppearanceScreen.options);
  }

  onSystemTextSizeChange(flag: boolean) {
    UI.settings.appearance.setUseSystemFontSize(flag);
  }

  @autobind
  onThemeChange(e, { id }) {
    UI.settings.appearance.setTheme(id);
  }

  onFontSizeChange(size) {
    UI.settings.appearance.setFontSize(size);
  }

  onStorySizePress() {
    const options = [{
      id: 'large',
      title: 'Large',
    }, {
      id: 'compact',
      title: 'Compact',
    }];

    openActionSheet({ options }, ({ id }) => {
      UI.settings.appearance.setStorySize(id);
    });
  }

  onShowPageEndingsChange(flag: boolean) {
    UI.settings.appearance.setShowPageEndings(flag);
  }

  render() {
    const { testID } = this.props;

    return (
      <ScrollView style={styles.host} contentContainerStyle={styles.host__container} testID={testID}>
        <CellGroup header="Text Size" footer={true}>
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
        <CellGroup header="Stories">
          <Cell
            title="Story Size"
            value={StorySizeLabel[UI.settings.appearance.storySize]}
            onPress={this.onStorySizePress}
          />
          <Cell
            title="Show Page Endings"
            value={<Switch value={UI.settings.appearance.showPageEndings} onValueChange={this.onShowPageEndingsChange} />}
          />
        </CellGroup>
        <CellGroup header="Large Stories">
          <Cell title="Show Vote button" value={true} />
          <Cell title="Show Download button" value={true} />
        </CellGroup>
        <CellGroup header="Compact Stories">
          <Cell title="Thumbnails" />
          <Cell title="Vote Button" />
        </CellGroup>
        <CellGroup header="Comments">
          <Cell title="Comments theme" />
          <Cell title="Rich Media Headers" />
        </CellGroup>
      </ScrollView>
    );
  }
}
