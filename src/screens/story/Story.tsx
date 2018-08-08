import * as React from 'react';
import { View, FlatList, Text, LayoutAnimation, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { autobind } from 'core-decorators';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
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

  @observable
  story: IItemType;

  @observable
  comments: IItemType[];

  @observable
  isRefreshing = false;

  @observable
  isLoading = true;

  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  componentDidMount() {
    this.fetch({ partial: true });
  }

  componentDidAppear() {
    this.fetch();
  }

  componentWillMount() {
    UI.addScreen(this);
  }

  componentWillUnmount() {
    UI.removeScreen(this);
  }

  @autobind
  async fetch({ partial = false } = {}) {
    const start = new Date().getTime();
    this.isLoading = true;
    this.story = await Items.fetchItem(this.props.id) as IItemType;

    if (!this.story || partial) {
      return;
    }

    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        title: {
          text: prettyNumber(this.story.descendants || 0, 'Comments'),
        },
      },
    });

    if (!UI.preview.active || (UI.preview.active && UI.settings.general.markReadOn3dTouch)) {
      this.story.read(true);
    }

    await this.story.fetchComments({ offset: 0 });

    // Wait at least 990ms for new data to make loading
    // indicators non janky.
    const delay = 990 - (new Date().getTime() - start);
    if (delay > 0 && this.isRefreshing) {
      await new Promise(r => setTimeout(r, delay));
    }

    this.isLoading = false;
  }

  @autobind
  onCollapse(comment: any) {
    this.collapsedInView.set(comment.id, true);
    this.updateComments(true);
  }

  @autobind
  onExpand(comment: any) {
    this.collapsedInView.set(comment.id, false);
    this.updateComments(true);
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
    await this.fetch();
    this.isRefreshing = false;
  }

  updateComments(animated: boolean = false) {
    this.story.flatComments.forEach((item: any) => {
      if (!item.belongsTo) return;
      if (item.belongsTo.find((r: any) => this.collapsedInView.get(r))) {
        this.hiddenInView.add(item);
      } else {
        this.hiddenInView.delete(item);
      }
    });

    this.forceUpdate();

    if (animated) {
      if (Platform.OS === 'android') {
        LayoutAnimation.configureNext({
          duration: 250,
          update: {
            type: LayoutAnimation.Types.spring,
            springDamping: 100,
          },
        });
      }
      if (Platform.OS === 'ios') {
        LayoutAnimation.easeInEaseOut();
      }
    }
  }

  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, StoryScreen.options);
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
    const size = this.story && this.story.comments.length;
    const isEmpty = !this.isLoading && size === 0;
    const data = size > 0 && this.story.flatComments;

    return (
      <View style={styles.host} testID="STORY_SCREEN">
        <FlatList
          ref={this.flatList}
          style={styles.list}
          ListHeaderComponent={<Header item={this.story} />}
          ListFooterComponent={this.isLoading && !this.isRefreshing && <Loading visible={true} />}
          ListEmptyComponent={isEmpty && <Empty message="No comments" />}
          data={data}
          extraData={this.collapsedInView.size}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          refreshing={this.isRefreshing}
          onRefresh={this.onRefresh}
          initialNumToRender={5}
          scrollEnabled={UI.scrollEnabled}
        />
      </View>
    );
  }
}
