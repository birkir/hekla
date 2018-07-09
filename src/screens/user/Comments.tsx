import * as React from 'react';
import { FlatList } from 'react-native';
import { observable, IObservableArray } from 'mobx';
import { observer } from 'mobx-react';
import { Navigation } from 'react-native-navigation';
import { autobind } from 'core-decorators';
import Hackernews from 'stores/services/Hackernews';
import UI from 'stores/UI';
import Items from 'stores/Items';
import Item from 'stores/models/Item';
import { applyThemeOptions } from 'styles';
import Loading from 'components/loading/Loading';
import Comment from 'components/comment/Comment';
import Empty from 'components/empty/Empty';

type IItemType = typeof Item.Type;

interface Props {
  userId: string;
  componentId: string;
}

@observer
export default class UserCommentsScreen extends React.Component<Props> {

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: 'Comments',
        },
      },
    });
  }

  page = 1;
  hasNextPage = true;

  @observable
  isLoading = false;

  @observable
  isRefreshing = false;

  @observable
  comments = [] as IObservableArray;

  componentWillMount() {
    this.fetch();
  }

  componentDidAppear() {
    this.updateOptions();
  }

  @autobind
  async onRefresh() {
    this.comments.clear();
    this.isRefreshing = true;
    await this.fetch();
    this.isRefreshing = false;
  }

  @autobind
  async onEndReached() {
    if (!this.isLoading && this.hasNextPage) {
      this.page += 1;
      this.fetch();
    }
  }

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, UserCommentsScreen.options);
  }

  @autobind
  async fetch() {
    this.isLoading = true;
    const noDupes = ([item, parent]) => !this.comments.find(([s]) => s.id === item.id);
    const lastComment = this.comments[this.comments.length - 1];
    const commentIds = await Hackernews.comments(this.props.userId, lastComment && lastComment[0].id);
    const comments = (await Promise.all(
      commentIds.map(({ id, parentId }) => {
        return Promise.all([Items.fetchItem(id), Items.fetchItem(parentId)]);
      }),
    )).filter(noDupes);

    if (comments.length === 0) {
      this.hasNextPage = false;
    }

    this.comments.push(...comments);
    this.isLoading = false;
  }

  @autobind
  keyExtractor(items: IItemType[], index: number) {
    if (!items) return `Comment_${index}_Empty`;
    return `Comment_${items[0].id}`;
  }

  @autobind
  renderComment({ item }: { item: IItemType[] }) {
    if (!item[0]) return null;
    return (
      <Comment
        key={item[0].id}
        item={item[0]}
        parent={item[1]}
        metalinks={false}
        card={true}
      />
    );
  }

  render() {
    const isEmpty = !(this.isLoading || this.isRefreshing) && this.comments.length === 0;
    return (
      <FlatList
        testID="USER_COMMENTS_SCREEN"
        data={this.comments}
        extraData={this.comments.length}
        ListEmptyComponent={isEmpty && <Empty message="No comments" />}
        ListFooterComponent={!this.isRefreshing && this.isLoading && <Loading end={true} />}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderComment}
        refreshing={this.isRefreshing}
        onEndReachedThreshold={0.75}
        onRefresh={this.onRefresh}
        onEndReached={this.onEndReached}
        scrollEnabled={UI.scrollEnabled}
      />
    );
  }
}
