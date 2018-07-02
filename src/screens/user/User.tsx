import * as React from 'react';
import { ScrollView, View } from 'react-native';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import Users from 'stores/Users';
import Loading from 'components/loading/Loading';
import { theme } from 'styles';
import prettyNumber from 'utils/prettyNumber';
import { autobind } from 'core-decorators';
import { userSubmissionsScreen, userCommentsScreen, userFavoritesScreen } from 'screens';
const styles = theme(require('./User.styl'));

interface Props {
  id?: string;
  componentId: string;
  testID?: string;
}

@observer
export default class UserScreen extends React.Component<Props> {

  @observable
  isLoading = false;

  @observable
  user;

  componentWillMount() {
    this.fetch();
  }

  async fetch() {
    this.isLoading = true;
    this.user = await Users.fetchUserById(this.props.id);
    this.isLoading = false;
  }

  @autobind
  onSubmissionsPress() {
    return userSubmissionsScreen(this.props.id);
  }

  @autobind
  onCommentsPress() {
    return userCommentsScreen(this.props.id);
  }

  @autobind
  onFavoritesPress() {
    return userFavoritesScreen(this.props.id);
  }

  render() {
    const { id, testID } = this.props;
    console.log(this.user);

    if (this.isLoading) {
      return (
        <View style={[styles.host, styles.host__container]}>
          <Loading />
        </View>
      );
    }

    return (
      <ScrollView style={styles.host} testID={testID} contentContainerStyle={styles.host__container}>
        <CellGroup>
          <Cell
            title="Karma"
            value={prettyNumber(this.user.karma)}
          />
          <Cell
            title="Account age"
            value={this.user.age}
          />
          <Cell title="About" value={this.user.about} />
        </CellGroup>
        <CellGroup>
          <Cell title="Submissions" onPress={this.onSubmissionsPress} more={true} />
          <Cell title="Comments" onPress={this.onCommentsPress} more={true} />
          <Cell title="Favorites" onPress={this.onFavoritesPress} more={true} />
        </CellGroup>
      </ScrollView>
    );
  }
}
