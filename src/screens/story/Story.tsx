import * as React from 'react';
import { View, FlatList, Text, LayoutAnimation, TouchableOpacity } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { autobind } from 'core-decorators';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import set from 'lodash/set';
import Item from 'stores/models/Item';
import Items from 'stores/Items';
import UI from 'stores/UI';
import prettyNumber from 'utils/prettyNumber';
import Header from './components/Header';
import Empty from 'components/empty/Empty';
import Loading from 'components/loading/Loading';
import LoadMoreComments from 'components/load-more-comments/LoadMoreComments';
import { theme, applyThemeOptions } from 'styles';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import CommentThread from 'components/comment-thread/CommentThread';
const styles = theme(require('./Story.styl'));

interface Props {
  children: React.ReactNode;
  componentId: string;
  id: string;
}

type IItemType = typeof Item.Type;

@observer
export default class StoryScreen extends React.Component<Props> {

  private collapsedInView = new Map();
  private hiddenInView = new Set();
  private flatList = React.createRef() as any;

  static get options() {
    return applyThemeOptions({
      topBar: {
        hideOnScroll: UI.settings.general.hideBarsOnScroll,
      },
    });
  }

  state = {
    loading: 0,
  } as any;

  @observable
  story: IItemType;

  @observable
  comments: IItemType[];

  @observable
  isRefreshing: boolean = false;

  componentDidAppear() {
    UI.setComponentId(this.props.componentId);
    this.updateOptions();
  }

  componentDidMount() {
    this.fetch();
  }

  @autobind
  async fetch({ force } = { force: false }) {
    console.log(this.props);
    const start = new Date().getTime();
    this.setState({ loading: 1 });
    this.story = await Items.fetchItem(this.props.id, { force }) as IItemType;
    console.log(this.story);
    this.updateOptions();
    this.setState({ loading: 2 });
    if (this.story) {
      if (!UI.preview.active || (UI.preview.active && UI.settings.general.markReadOn3dTouch)) {
        this.story.read(true);
      }
      await this.story.fetchComments({ force, offset: 0 });
    }

    // Wait at least 990ms for new data to make loading
    // indicators non janky.
    const delay = 990 - (new Date().getTime() - start);
    if (delay > 0 && this.isRefreshing) {
      await new Promise(r => setTimeout(r, delay));
    }

    this.setState({ loading: 0 });
  }

  @autobind
  onCollapse(comment: any) {
    this.collapsedInView.set(comment.id, true);
    this.updateComments();
    LayoutAnimation.easeInEaseOut();
  }

  @autobind
  onExpand(comment: any) {
    this.collapsedInView.set(comment.id, false);
    this.updateComments();
    LayoutAnimation.easeInEaseOut();
  }

  @autobind
  async onMorePress({ item }: { item: IItemType }) {
    await item.fetchComments({ count: 20 });
    this.forceUpdate();
  }

  @autobind
  async onRefresh() {
    ReactNativeHapticFeedback.trigger('impactLight', true);
    this.isRefreshing = true;
    await this.fetch({ force: true });
    this.isRefreshing = false;
  }

  updateComments() {
    this.story.flatComments.forEach((item: any) => {
      if (!item.belongsTo) return;
      if (item.belongsTo.find((r: any) => this.collapsedInView.get(r))) {
        this.hiddenInView.add(item);
      } else {
        this.hiddenInView.delete(item);
      }
    });
    this.forceUpdate();
  }

  async updateOptions() {
    const opts = StoryScreen.options;
    if (this.story) {
      set(opts, 'topBar.title.text', prettyNumber(this.story.descendants || 0, 'Comments'));
    }
    Navigation.mergeOptions(this.props.componentId, opts);
  }

  @autobind
  keyExtractor(item: any, index: number) {
    return `Comment_${item.id}`;
  }

  @autobind
  renderItem({ item }: { item: any }) {
    if (!item) {
      return null;
    }

    if (item.type === 'more') {
      return (
        <LoadMoreComments
          item={item.comment}
          onPress={this.onMorePress}
          hidden={this.collapsedInView.get(item.comment.id) || this.hiddenInView.has(item.comment)}
        />
      );
    }

    if (item.type === 'comment') {
      return (
        <CommentThread
          onCollapse={this.onCollapse}
          onExpand={this.onExpand}
          depth={item.belongsTo.length - 1}
          collapsed={this.collapsedInView.get(item.id)}
          hidden={this.hiddenInView.has(item)}
          item={item}
        />
      );
    }

    return null;
  }

  render() {
    const { loading } = this.state;
    const size = this.story && this.story.comments.length;
    const isEmpty = loading === 0 && size === 0;
    const data = size > 0 && this.story.flatComments;
    return (
      <View style={styles.host} testID="STORY_SCREEN">
        <FlatList
          ref={this.flatList}
          style={styles.list}
          ListHeaderComponent={!UI.preview.active && <Header item={this.story} />}
          ListFooterComponent={loading > 0 && <Loading previewing={UI.preview.active} />}
          ListEmptyComponent={isEmpty && <Empty message="No comments" />}
          data={data}
          extraData={this.collapsedInView.size}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          refreshing={this.isRefreshing}
          onRefresh={this.onRefresh}
          initialNumToRender={5}
        />
      </View>
    );
  }
}
