import * as React from 'react';
import { ScrollView, Switch } from 'react-native';
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import { storySize, formatStorySize } from 'stores/enums/StorySize';
import { formatCompactThumbnail, compactThumbnail } from 'stores/enums/CompactThumbnail';
import { formatCompactVoteButton, compactVoteButton } from 'stores/enums/CompactVoteButton';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import SliderFontSize from 'components/slider-font-size/SliderFontSize';
import openActionSheet from 'utils/openActionSheet';
import UI from 'stores/UI';
import { Navigation } from 'react-native-navigation';
import { startApp } from 'screens';
import { theme, applyThemeOptions } from 'styles';
const styles = theme(require('./Settings.styl'));

interface Props {
  componentId?: string;
  testID?: string;
}

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
    UI.settings.setValue('appearance.useSystemFontSize', flag);
  }

  onFontSizeChange(size) {
    UI.settings.setValue('appearance.fontSize', size);
  }

  onStorySizePress() {
    const options = (Object as any).entries(storySize).map(([id, title]) => ({ id, title }));

    openActionSheet({ options, title: 'Story Size', selectedId: UI.settings.appearance.storySize }, ({ id }) => {
      UI.settings.setValue('appearance.storySize', id);
    });
  }

  onShowPageEndingsChange(flag: boolean) {
    UI.settings.setValue('appearance.showPageEndings', flag);
  }

  onLargeShowVoteButtonChange(flag: boolean) {
    UI.settings.setValue('appearance.largeShowVoteButton', flag);
  }

  onLargeShowDownloadButtonChange(flag: boolean) {
    UI.settings.setValue('appearance.largeShowDownloadButton', flag);
  }

  onCompactThumbnailPress() {
    const options = (Object as any).entries(compactThumbnail).map(([id, title]) => ({ id, title }));

    openActionSheet({ options, title: 'Compact Thumbnail', selectedId: UI.settings.appearance.compactThumbnail }, ({ id }) => {
      UI.settings.setValue('appearance.compactThumbnail', id);
    });
  }

  onCompactVoteButtonPress() {
    const options = (Object as any).entries(compactVoteButton).map(([id, title]) => ({ id, title }));

    openActionSheet({ options, title: 'Compact Vote Button', selectedId: UI.settings.appearance.compactVoteButton }, ({ id }) => {
      UI.settings.setValue('appearance.compactVoteButton', id);
    });
  }

  onCommentsUseColorSchemeChange(flag: boolean) {
    UI.settings.setValue('appearance.commentsUseColorScheme', flag);
  }

  onCommentsShowMetaLinksChange(flag: boolean) {
    UI.settings.setValue('appearance.commentsShowMetaLinks', flag);
  }

  oniPadSidebarChange(flag: boolean) {
    UI.settings.setValue('appearance.iPadSidebarEnabled', flag);
    UI.restartApp();
  }

  render() {
    const { testID } = this.props;

    return (
      <ScrollView style={styles.host} contentContainerStyle={styles.host__container} testID={testID}>
        <CellGroup header="iPad" footer={true}>
          <Cell
            title="Use sidebar on iPad"
            value={(
              <Switch
                value={UI.settings.appearance.iPadSidebarEnabled}
                onValueChange={this.oniPadSidebarChange}
              />
            )}
          />
        </CellGroup>
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
        <CellGroup header="Stories">
          <Cell
            title="Story Size"
            value={formatStorySize(UI.settings.appearance.storySize)}
            onPress={this.onStorySizePress}
          />
          <Cell
            title="Show Page Endings"
            value={<Switch value={UI.settings.appearance.showPageEndings} onValueChange={this.onShowPageEndingsChange} />}
          />
        </CellGroup>
        <CellGroup header="Large Stories">
          <Cell
            title="Show Vote button"
            value={<Switch value={UI.settings.appearance.largeShowVoteButton} onValueChange={this.onLargeShowVoteButtonChange} />}
          />
          <Cell
            title="Show Download button"
            value={<Switch value={UI.settings.appearance.largeShowDownloadButton} onValueChange={this.onLargeShowDownloadButtonChange} />}
          />
        </CellGroup>
        <CellGroup header="Compact Stories">
          <Cell
            title="Thumbnails"
            value={formatCompactThumbnail(UI.settings.appearance.compactThumbnail)}
            onPress={this.onCompactThumbnailPress}
          />
          <Cell
            title="Vote Button"
            value={formatCompactVoteButton(UI.settings.appearance.compactVoteButton)}
            onPress={this.onCompactVoteButtonPress}
          />
        </CellGroup>
        <CellGroup header="Comments">
          <Cell
            title="Use Color Scheme"
            value={<Switch value={UI.settings.appearance.commentsUseColorScheme} onValueChange={this.onCommentsUseColorSchemeChange} />}
          />
          <Cell
            title="Rich Meta Links"
            value={<Switch value={UI.settings.appearance.commentsShowMetaLinks} onValueChange={this.onCommentsShowMetaLinksChange} />}
          />
        </CellGroup>
      </ScrollView>
    );
  }
}
