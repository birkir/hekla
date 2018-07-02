import cheerio from 'react-native-cheerio'; // tslint:disable-line import-name
import { AsyncStorage } from 'react-native';

const getKey = url => `MetaData_${url}`;

export const fetchMetadataCache = async (url: string) => {
  const cached = await AsyncStorage.getItem(getKey(url));

  try {
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {}

  return;
};

export default async (url: string) => {

  if (!url) {
    return null;
  }

  const key = getKey(url);
  const cached = await fetchMetadataCache(url);
  if (cached) {
    return cached;
  }

  const metaModel = {} as {
    title: string;
    description: string;
    author: string;
    tags: string[];
    image: string;
    opengraph: any;
    twitter: any;
    itemProp: any;
    article: any;
    facebookAppId: string;
  };

  try {

    if (url.match(/\.pdf$/)) {
      return {};
    }

    const body = await (await fetch(url)).text();
    const $ = await cheerio.load(body);

    // Fetch base tags
    metaModel.title = $('title').text();
    metaModel.description = $('meta[name=description]').attr('content');
    metaModel.author = $('meta[name=author]').attr('content');
    if (metaModel.author === undefined) {
      metaModel.author = $('meta[property="author"]').attr('content');
    }
    const tags = $('meta[name=keywords]').attr('content') || '';
    metaModel.tags = tags.split(',').map((item: string) => item.trim());

    // Fetch opengraph
    metaModel.opengraph = {
      url: $('meta[property="og:url"]').attr('content'),
      type: $('meta[property="og:type"]').attr('content'),
      title: $('meta[property="og:title"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      site_name: $('meta[property="og:site_name"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
      website: $('meta[property="og:website"]').attr('content'),
      profile: {
        first_name: $('meta[property="og:profile:first_name"]').attr('content'),
        last_name: $('meta[property="og:profile:last_name"]').attr('content'),
        username: $('meta[property="og:profile:username"]').attr('content'),
        gender: $('meta[property="og:profile:gender"]').attr('content'),
      },
      book: {
        author: $('meta[property="og:book:author"]').attr('content'),
        isbn: $('meta[property="og:book:isbn"]').attr('content'),
        release_date:$('meta[property="og:book:release_date"]').attr('content'),
        tag: $('meta[property="og:book:tag"]').attr('content'),
      },
      article: {
        published_time: $('meta[property="og:article:published_time"]').attr('content'),
        modified_time: $('meta[property="og:article:modified_time"]').attr('content'),
        expiration_time: $('meta[property="og:article:expiration_time"]').attr('content'),
        author: $('meta[property="og:article:author"]').attr('content'),
        section: $('meta[property="og:article:section"]').attr('content'),
        tag: $('meta[property="og:article:tag"]').attr('content'),
      },
      video: $('meta[property="og:video"]').attr('content'),
      video_type: $('meta[property="og:video:type"]').attr('content'),
      audio: $('meta[property="og:audio"]').attr('content'),
      audio_type: $('meta[property="og:audio:type"]').attr('content'),
      price_amount: $('meta[property="og:price:amount"]').attr('content'),
      price_currency: $('meta[property="og:price:currency"]').attr('content'),
    };

    // Fetch twitter
    const twitterKey = $('meta[property="twitter:title"]').attr('content') === undefined
      ? 'name' : 'property';
    if (twitterKey) {
      metaModel.twitter = {
        card: $(`meta[${twitterKey}="twitter:card"]`).attr('content'),
        site: $(`meta[${twitterKey}="twitter:site"]`).attr('content'),
        title: $(`meta[${twitterKey}="twitter:title"]`).attr('content'),
        image: $(`meta[${twitterKey}="twitter:image"]`).attr('content'),
        creator: $(`meta[${twitterKey}="twitter:creator"]`).attr('content'),
        description: $(`meta[${twitterKey}="twitter:description"]`).attr('content'),
      };
    }

    // Facebook app id
    const facebookKey = $('meta[property="fb:app_id"]').attr('content') === undefined
      ? 'name' : 'property';
    metaModel.facebookAppId = $(`meta[${facebookKey}="fb:app_id"]`).attr('content');

    // Fetch item props
    metaModel.itemProp = {
      name: $('meta[itemprop=name]').attr('content'),
      description: $('meta[itemprop=description]').attr('content'),
      image: $('meta[itemprop=image]').attr('content'),
    };

    // Fetch article
    metaModel.article = {
      tag: $('meta[property="article:tag"]').attr('content'),
      section: $('meta[property="article:section"]').attr('content'),
      published_time: $('meta[property="article:published_time"]').attr('content'),
      modified_time: $('meta[property="article:modified_time"]').attr('content'),
    };

    // Set image
    if (metaModel.image === undefined) {
      if (metaModel.itemProp.image) {
        metaModel.image = metaModel.itemProp.image;
      } else if (metaModel.opengraph.image) {
        metaModel.image = metaModel.opengraph.image;
      } else if (metaModel.twitter.image) {
        metaModel.image = metaModel.twitter.image;
      }
    }
  } catch (err) {}

  // Setup cache object
  const { title, description, author, tags, image } = metaModel;
  const obj = { title, description, author, tags, image };

  // Store as cache
  AsyncStorage.setItem(key, JSON.stringify(obj));

  return obj;
};
