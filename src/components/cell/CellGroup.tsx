import * as React from 'react';
import { View, Text, Platform } from 'react-native';
import { theme } from 'styles';
const styles = theme(require('./CellGroup.styl'));

interface Props {
  key?: string;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  testID?: string;
}

export default class CellGroup extends React.PureComponent<Props, any> {

  renderHeader() {
    const { header } = this.props;

    if (!header) return null;

    if (typeof header === 'boolean' && header === true) {
      return <View style={[styles.header, styles.header__empty]} />;
    }

    if (typeof header === 'object' && React.isValidElement(header)) {
      return header;
    }

    return (
      <View style={[styles.header, styles[`header__${Platform.OS}`]]}>
        <Text style={[styles.header__text, styles[`header__text__${Platform.OS}`]]}>{String(header).toUpperCase()}</Text>
      </View>
    );
  }

  renderItem(item, index) {
    if (React.isValidElement(item) === false) {
      return null;
    }

    return React.cloneElement(item, { ...item.props, index });
  }

  renderFooter() {
    const { footer = true } = this.props;
    if (!footer) return null;

    if (typeof footer === 'boolean' && footer === true) {
      return <View style={[styles.footer, styles.footer__empty]} />;
    }

    if (typeof footer === 'object' && React.isValidElement(footer)) {
      return footer;
    }

    return (
      <View style={[styles.footer, styles[`footer__${Platform.OS}`]]}>
        <Text style={[styles.footer__text, styles[`footer__text__${Platform.OS}`]]}>{String(footer)}</Text>
      </View>
    );
  }

  render() {
    const { children } = this.props;

    return (
      <View style={[styles.host, styles[`host__${Platform.OS}`]]}>
        {this.renderHeader()}
        <View style={[styles.items, styles[`items__${Platform.OS}`]]}>
          {React.Children.map(children, this.renderItem)}
        </View>
        {this.renderFooter()}
      </View>
    );
  }
}
