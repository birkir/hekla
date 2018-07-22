import * as React from 'react';
import { ScrollView, Platform, Text, Alert, ActivityIndicator } from 'react-native';
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
    'tip01',
    'tip02',
    'tip03',
    'tip04',
  ],
  android: [
    'tip01',
    'tip02',
    'tip03',
    'tip04',
  ],
});

const products = {
  tip01: 'Nice Tip',
  tip02: 'Generous Tip',
  tip03: 'Awesome Tip',
  tip04: 'Amazing Tip',
};

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

  @observable
  loading = false;

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
    this.loading = true;
    try {
      const status = await RNIap.prepare();
      this.products = await RNIap.getProducts(SKUs);
    } catch (err) {
      Sentry.captureException(err);
    }
    this.loading = false;
  }

  @autobind
  async onProductPress(e, { item }) {
    try {
      const success = await RNIap.buyProduct(item.productId);
      if (success) {
        Alert.alert('Thank you', 'Your support is greatly appreciated');
      } else {
        Alert.alert('Could not complete transaction');
      }
    } catch (err) {
      Sentry.captureException(err);
      Alert.alert('Something went wrong', err.message);
    }
  }

  @autobind
  renderTitle(product) {
    if (product.title && product.title !== '') {
      return product.title.replace('(Hekla)', '');
    }
    if (products[product.productId]) {
      return products[product.productId];
    }
    return product.description;
  }

  @autobind
  renderProduct(product) {
    return (
      <Cell
        key={product.productId}
        item={product}
        title={this.renderTitle(product)}
        value={product.localizedPrice}
        onPress={this.onProductPress}
      />
    );
  }

  render() {
    const { testID } = this.props;
    return (
      <ScrollView
        style={styles.host}
        contentContainerStyle={styles.host__container}
        testID={testID}
      >
        <Text style={styles.text}>
          Oh wow, thanks, thanks to all of you, for reporting bugs, for requesting features, and, most importantly, for just using the app.
          {'\n\n'}
          Every contribution helps the app to stay current and fresh, thank you so much for even consider it.
        </Text>

        {this.products.length > 0 && (
          <CellGroup>
            {this.products.map(this.renderProduct)}
          </CellGroup>
        )}
        {this.products.length === 0 && (
          <React.Fragment>
            {this.loading ? <ActivityIndicator /> : <Text style={styles.thankYou}>No products available</Text>}
          </React.Fragment>
        )}
      </ScrollView>
    );
  }
}
