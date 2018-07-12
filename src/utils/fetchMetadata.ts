// import cheerio from 'react-native-cheerio'; // tslint:disable-line import-name
import { AsyncStorage } from 'react-native';
import { Sentry } from 'react-native-sentry';
import firebase from 'react-native-firebase';
import config from 'config';

let token;
const ref = firebase.firestore().collection('metadata');
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

  const docs = await ref.where('url', '==', url).get() as any;
  if (!docs.empty) {
    const doc = docs.docs[0];
    if (doc.exists) {
      const obj = doc.data();
      if (obj.image) {
        AsyncStorage.setItem(key, JSON.stringify(obj));
        return obj;
      }
    }
  }

  const obj = { url } as any;

  try {
    if (!token) {
      const { access_token } = await fetch(`https://graph.facebook.com/oauth/access_token?client_id=${config.FB_CLIENT_ID}&client_secret=${config.FB_CLIENT_SECRET}&grant_type=client_credentials`).then(r => r.json());
      token = access_token;
    }
    const { og_object } = await fetch(`https://graph.facebook.com/${encodeURIComponent(url)}`).then(r => r.json());
    if (og_object) {
      obj.title = og_object.title;
      obj.description = og_object.description;
      obj.type = og_object.type;
      try {
        const { image } = await fetch(`https://graph.facebook.com/${og_object.id}?fields=image&access_token=${token}`).then(r => r.json());
        obj.image = image.shift();
        obj.image.error = false;
      } catch (err) {
        Sentry.captureException(err);
        token = null;
        obj.image = {
          url: null,
          error: true,
        };
      }
    }
  } catch (err) {
    token = null;
  }

  // Store as cache
  AsyncStorage.setItem(key, JSON.stringify(obj));
  ref.add(obj);

  return obj;
};
