import * as React from 'react';
import { ScrollView, Switch, Platform } from 'react-native';
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import { Navigation } from 'react-native-navigation';
import storyTypeActionSheet from 'utils/actionsheets/storyType';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import UI from 'stores/UI';
import { theme, applyThemeOptions } from 'styles';
import { DefaultBrowserValues, formatDefaultBrowser } from 'stores/enums/DefaultBrowser';
import openActionSheet from 'utils/openActionSheet';
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

  onDefaultStoriesToLoadPress() {
    storyTypeActionSheet(({ id }) => UI.settings.setValue('general.defaultStoriesToLoad', id));
  }

  onMarkReadOn3dTouchChange(value: boolean) {
    UI.settings.setValue('general.markReadOn3dTouch', value);
  }

  onHideBarsOnScrollChange(value: boolean) {
    UI.settings.setValue('general.hideBarsOnScroll', value);
  }

  onCommentTapToCollapseChange(value: boolean) {
    UI.settings.setValue('general.commentTapToCollapse', value);
  }

  onCommentSwipeActionsChange(value: boolean) {
    UI.settings.setValue('general.commentSwipeActions', value);
  }

  @autobind
  onOpenLinksInPress() {
    const options = (Object as any).entries(DefaultBrowserValues).map(([id, title]) => ({
      id,
      title,
      titleTextAlignment: 0,
    }));
    openActionSheet({ options, title: 'Open Links in', cancel: 'Cancel', selectedId: UI.settings.general.browserOpenIn }, this.onOpenLinksInChange);
  }

  @autobind
  onOpenLinksInChange(item) {
    UI.settings.setValue('general.browserOpenIn', item.id);
  }

  onBrowserUseReaderMode(value: boolean) {
    UI.settings.setValue('general.browserUseReaderMode', value);
  }

  render() {
    const { testID } = this.props;

    return (
      <ScrollView style={styles.host} contentContainerStyle={styles.host__container} testID={testID}>
        <CellGroup header="General">
          <Cell
            title="Default Stories to Load"
            value={UI.settings.general.defaultStoriesToLoadValue}
            onPress={this.onDefaultStoriesToLoadPress}
          />
          <Cell
            title="3D Touch Marks Stories Read"
            value={<Switch
              value={UI.settings.general.markReadOn3dTouch}
              onValueChange={this.onMarkReadOn3dTouchChange}
            />}
          />
          <Cell
            title="Hide bars on Scroll"
            value={<Switch
              value={UI.settings.general.hideBarsOnScroll}
              onValueChange={this.onHideBarsOnScrollChange}
            />}
          />
        </CellGroup>
        <CellGroup header="Comments">
          <Cell
            title="Tap to Collapse"
            value={<Switch
              value={UI.settings.general.commentTapToCollapse}
              onValueChange={this.onCommentTapToCollapseChange}
            />}
          />
          <Cell
            title="Enable Actions on Swipe"
            value={<Switch
              value={UI.settings.general.commentSwipeActions}
              onValueChange={this.onCommentSwipeActionsChange}
            />}
          />
        </CellGroup>
        <CellGroup header="Browser">
          {Platform.OS === 'ios' && (
            <Cell
              title="Always Use Reader Mode"
              value={<Switch
                value={UI.settings.general.browserUseReaderMode}
                onValueChange={this.onBrowserUseReaderMode}
              />}
            />
          )}
          <Cell
            title="Open links in"
            value={formatDefaultBrowser(UI.settings.general.browserOpenIn)}
            onPress={this.onOpenLinksInPress}
          />
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
