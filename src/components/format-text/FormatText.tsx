import * as React from 'react';
import { View, Text, TextStyle } from 'react-native';
import { autobind } from 'core-decorators';
import MetaLink from 'components/meta-link/MetaLink';
import Link from './Link';
import { theme } from 'styles';
import { observer } from 'mobx-react';
import stripIndent from 'strip-indent';
const styles = theme(require('./FormatText.styl'));

interface Props {
  key?: string;
  children?: React.ReactNode;
  allowFontScaling?: boolean;
  style?: TextStyle | TextStyle[];
  noLinks?: boolean;
  noFormat?: boolean;
  numberOfLines?: number;
  testID?: string;
}

@observer
export default class FormatText extends React.Component<Props> {

  @autobind
  mapTextLine(line: string, index: number, lines: string[]) {
    const { noFormat } = this.props;

    // Detect if line is a quote
    const isQuote = line.trim().substr(0, 1) === '>';
    const isCode = line.trim().match(/<pre><code>.*?<\/code><\/pre>/);
    const isLast = index === lines.length - 1;

    // Regex matcher
    const re = /(<i>.*?<\/i>|<b>.*?<\/b>|<a.*?>.*?<\/a>|<pre><code>.*?<\/code><\/pre>)/;

    // Get line parts (and remove quotes)
    const parts = line.replace(/^>/, '').split(re);

    // Map line parts to React components
    const reactLine = parts
      .map(this.mapTextLinePart)
      .filter(item => item !== null);

    // Display as quote
    if (!noFormat && isQuote) {
      return (
        <View key={index} style={[styles.quote, !isLast && styles.line]}>
          <Text style={[styles.quote__text, this.props.style]}>{reactLine}</Text>
        </View>
      );
    }

    if (!noFormat && isCode) {
      const codeLines = reactLine.filter(n => String(n.key).indexOf('_CODE') >= 0);
      const otherLines = reactLine.filter(n => String(n.key).indexOf('_CODE') === -1);

      return (
        <React.Fragment key={index}>
          <View style={[styles.code, styles.line]}>{codeLines}</View>
          <Text style={styles.line}>
            {otherLines}{noFormat ? '\n' : ''}
          </Text>
        </React.Fragment>
      );
    }

    return (
      <Text key={index} style={styles.line}>
        {reactLine}{noFormat ? '\n' : ''}
      </Text>
    );
  }

  @autobind
  mapTextLinePart(partStr: string, index: number) {
    const { noFormat } = this.props;
    const part = partStr.replace(/\${NEWLINE}/g, '');
    // Regex matchers
    const isItalic = part.match(/<i>(.*?)<\/i>/);
    const isBold = part.match(/<b>(.*?)<\/b>/);
    const isLink = part.match(/<a.*?href="(.*?)".*?>(.*?)<\/a>/);
    const isCode = partStr.match(/<pre><code>(.*?)<\/code><\/pre>/);

    if (part.trim() === '') {
      return null;
    }

    if (isCode) {
      return (
        <Text style={[this.props.style, !noFormat && styles.code__text]} key={`${index}_CODE`}>
          {stripIndent(isCode[1].replace(/\${NEWLINE}/g, '\n'))}
        </Text>
      );
    }

    if (isItalic) {
      return (
        <Text style={[styles.italic, this.props.style]} key={index}>{isItalic[1]}{' '}</Text>
      );
    }

    if (isBold) {
      return (
        <Text style={[styles.bold, this.props.style]} key={index}>{isBold[1]}{' '}</Text>
      );
    }

    if (isLink) {
      if (noFormat) {
        return (
          <Text key={index} style={this.props.style}>{isLink[2]}{' '}</Text>
        );
      }

      return (
        <Link key={index}>{isLink[2]}{' '}</Link>
      );
    }

    return (
      <Text style={this.props.style} key={index} allowFontScaling={this.props.allowFontScaling}>
        {part.trim()}{' '}
      </Text>
    );
  }

  render() {
    const { noLinks, noFormat, numberOfLines } = this.props;
    const text = String(this.props.children || '');

    // Get text as individual lines
    const lines = text.replace(/\n/g, '${NEWLINE}').split('<p>');

    // Extract links for text
    const links = (text.match(/<a.*?href="(.*?)".*?>(.*?)<\/a>/g) || []).map((anchorTag) => {
      const [, url, title] = anchorTag.match(/<a.*?href="(.*?)".*?>(.*?)<\/a>/);
      return { url, title };
    });

    if (noFormat) {
      return (
        <Text numberOfLines={numberOfLines}>
          {lines.map(this.mapTextLine)}
        </Text>
      );
    }

    // Map lines to React components
    return (
      <View style={styles.host}>
        {lines.map(this.mapTextLine)}
        {!noLinks && links.map(link => <View style={styles.line} key={link.url}><MetaLink {...link} /></View>)}
      </View>
    );
  }
}
