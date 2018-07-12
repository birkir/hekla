import * as React from 'react';
import { ScrollView, Platform, Text } from 'react-native';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { autobind } from 'core-decorators';
import { Navigation } from 'react-native-navigation';
import { Sentry } from 'react-native-sentry';
import * as RNIap from 'react-native-iap';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import { theme, applyThemeOptions } from 'styles';
const styles = theme(require('./Donate.styl'));

interface Props {
  componentId?: string;
  testID?: string;
}

const SKUs = Platform.select({
  ios: [
    '1001',
  ],
  android: [
    'android.test.purchased',
    'android.test.canceled',
  ],
});

@observer
export default class SettingsDonateScreen extends React.Component<Props> {

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: 'Donate',
        },
      },
    });
  }

  @observable
  products = [];

  componentWillMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    RNIap.endConnection();
  }

  componentDidAppear() {
    this.updateOptions();
  }

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, SettingsDonateScreen.options);
  }

  async fetchData() {
    try {
      await RNIap.prepare();
      this.products = await RNIap.getProducts(SKUs);
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  renderProduct(product) {
    return (
      <Cell
        title={`${product.productId} - ${product.title}`}
        subtitle={product.description}
        value={product.localizedPrice}
      />
    );
  }

  render() {
    const { testID } = this.props;
    return (
      <ScrollView style={styles.host} contentContainerStyle={styles.host__container} testID={testID}>
        <Text style={styles.thankYou}>Thank you for supporting Hekla for Hacker News</Text>
        {this.products.length > 0 && (
          <CellGroup>
            {this.products.map(this.renderProduct)}
          </CellGroup>
        )}
      </ScrollView>
    );
  }
}
