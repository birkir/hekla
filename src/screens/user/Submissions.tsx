import * as React from 'react';
import { FlatList } from 'react-native';
import { observable, IObservableArray } from 'mobx';
import { observer } from 'mobx-react';
import { Navigation } from 'react-native-navigation';
import { autobind } from 'core-decorators';
import StoryCard from 'components/story-card/StoryCard';
import Hackernews from 'stores/services/Hackernews';
import UI from 'stores/UI';
import Items from 'stores/Items';
import Item from 'stores/models/Item';
import { applyThemeOptions } from 'styles';
import Loading from 'components/loading/Loading';
import Empty from 'components/empty/Empty';

type IItemType = typeof Item.Type;

interface Props {
  userId: string;
  componentId: string;
}

@observer
export default class UserSubmissionsScreen extends React.Component<Props> {

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: 'Submissions',
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
  submissions = [] as IObservableArray;

  componentWillMount() {
    this.fetch();
  }

  componentDidAppear() {
    this.updateOptions();
  }

  @autobind
  async onRefresh() {
    this.submissions.clear();
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
    Navigation.mergeOptions(this.props.componentId, UserSubmissionsScreen.options);
  }

  @autobind
  async fetch() {
    this.isLoading = true;
    const noDupes = item => !this.submissions.find(s => s.id === item.id);
    const submissionIds = await Hackernews.submissions(this.props.userId, this.page);
    const submissions = (await Promise.all(
      submissionIds.map(({ id }) => Items.fetchItem(id)),
    )).filter(noDupes);

    if (submissions.length === 0) {
      this.hasNextPage = false;
    }

    this.submissions.push(...submissions);
    this.isLoading = false;
  }

  @autobind
  keyExtractor(item: IItemType, index: number) {
    if (!item) return `Story_${index}_Empty`;
    return `Story_${item.id}`;
  }

  @autobind
  renderStory({ item }: { item: IItemType }) {
    if (!item) return null;
    return (
      <StoryCard
        key={item.id}
        item={item}
      />
    );
  }

  render() {
    const isEmpty = !(this.isLoading || this.isRefreshing) && this.submissions.length === 0;
    return (
      <FlatList
        testID="USER_SUBMISSIONS_SCREEN"
        data={this.submissions}
        extraData={this.submissions.length}
        ListEmptyComponent={isEmpty && <Empty message="No submissions" />}
        ListFooterComponent={!this.isRefreshing && this.isLoading && <Loading end={true} />}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderStory}
        refreshing={this.isRefreshing}
        onEndReachedThreshold={0.75}
        onRefresh={this.onRefresh}
        onEndReached={this.onEndReached}
        scrollEnabled={UI.scrollEnabled}
      />
    );
  }
}
