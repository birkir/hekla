export const API_URL = 'https://news.ycombinator.com';
export const LOGIN_EXISTS = 1;
export const LOGIN_INCORRECT = 2;
export const LOGIN_ERROR = 3;
export const LOGIN_SUCCESS = 4;

/**
 * This class can fetch and parse pages on HackerNews.
 * Credentials are stored in the keychain.
 */
class Hackernews {

  async fetch(url = '', options = { headers: {} } as any) {
    return fetch(`${API_URL}/${url}`, {
      ...options,
      headers: {
        authority: 'news.ycombinator.com',
        origin: API_URL,
        referer: `${API_URL}/`,
        'user-agent': 'Piper_1.0',
        ...(options.headers || {}),
      },
    })
    .then(res => res.text());
  }

  /**
   * Login with username and password
   */
  async login(username: string, password: string) {
    try {
      const startMarkup = await this.fetch();
      if (startMarkup.match(/logout\?auth/)) {
        return LOGIN_EXISTS;
      }

      const loginMarkup = await this.fetch('login', {
        method: 'post',
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: `goto=news&acct=${encodeURIComponent(username)}&pw=${encodeURIComponent(password)}`,
      });

      if (loginMarkup.match(/Bad login/)) {
        return LOGIN_INCORRECT;
      }

      if (!loginMarkup.match(/logout\?auth/)) {
        const checkMarkup = await this.fetch();
        if (!checkMarkup.match(/logout\?auth/)) {
          return LOGIN_ERROR;
        }
      }
    } catch (err) {
      return LOGIN_ERROR;
    }

    return LOGIN_SUCCESS;
  }

  async logout() {
    const auths = await this.fetchAuthsForItem('1000');
    const { auth = null } = auths.find(item => item.action === 'logout') || {};
    if (!auth) return false;
    await this.fetch(`logout?auth=${auth}`);
    const checkMarkup = await this.fetch();
    if (checkMarkup.match(/logout\?auth/)) {
      return false;
    }
    return true;
  }

  async fetchAuthsForItem(id) {
    const data = await this.fetch(`item?id=${id}`);

    return (String(data || '').match(/(["'])(?:(?=(\\?))\2.)*?\1/g) || [])
      .filter(n => n.match(/auth=/))
      .map((item) => {
        const ret = {} as any;
        const action = item.match(/["'](.*?)\?/);
        const id = item.match(/["'].*?id=([0-9]*)/);
        const auth = item.match(/["'].*?auth=([a-f0-9]*)/);
        if (action && action[1]) ret.action = action[1];
        if (id && id[1]) ret.id = id[1];
        if (auth && auth[1]) ret.auth = auth[1];
        return ret;
      });
  }

  async fetchHmacForItem(id, type = 'reply') {
    const hmacData = await this.fetch(`${type}?id=${id}`);
    const hmac = hmacData.match(/name="hmac" value="([a-f0-9]*)"/);
    return hmac && hmac[1];
  }

  async fetchItemIdsByUrl(url) {
    const html = await this.fetch(url);
    const matches = html.match(/id=([0-9]+)/g);
    return matches.map(n => (n.match(/[0-9]+$/) || []).shift());
  }

  async favorite(id, flag = false) {
    const auths = await this.fetchAuthsForItem(id);
    const { auth = null } = auths.find(item => item.action === 'fave' && item.id === id) || {};
    const unhideqs = !flag ? '&un=t' : '';

    if (auth) {
      await this.fetch(`fave?id=${id}&auth=${auth}${unhideqs}`);
      // TODO: How can we make sure it's favorited?
      return true;
    }

    return false;
  }

  async hide(id, hide = false) {
    const auths = await this.fetchAuthsForItem(id);
    const { auth = null } = auths.find(item => item.action === 'hide' && item.id === id) || {};
    const unhideqs = !hide ? '&un=t' : '';

    if (auth) {
      await this.fetch(`hide?id=${id}&auth=${auth}${unhideqs}`);
      // TODO: How can we make sure it's hidden?
      return true;
    }

    return false;
  }

  async flag(id, flag = false) {
    const auths = await this.fetchAuthsForItem(id);
    const { auth = null } = auths.find(item => item.action === 'flag' && item.id === id) || {};
    const unflagqs = !flag ? '&un=t' : '';

    if (auth) {
      await this.fetch(`flag?id=${id}&auth=${auth}${unflagqs}`);
      // TODO: How can we make sure it's flagged?
      return true;
    }

    return false;
  }

  async vote(id, up = true) {
    const how = up ? 'up' : 'un';
    const auths = await this.fetchAuthsForItem(id);
    const { auth = null } = auths.find(item => item.action === 'vote' && item.id === id) || {};
    if (auth) {
      const output = await this.fetch(`vote?id=${id}&how=${how}&auth=${auth}`);
      // TODO: How can we make sure it's flagged?
      return true;
    }

    return false;
  }

  async reply(id: string, text: string, forceHmac?: string) {
    const hmac = await this.fetchHmacForItem(id, 'reply');
    if (!hmac) {
      return false;
    }

    const data = await this.fetch('comment', {
      method: 'post',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: `parent=${id}&hmac=${hmac}&text=${text}`,
    });

    if (data.match(/Please confirm that this is your comment by submitting it one more time/)) {
      throw new Error('Please confirm that this is your comment by submitting it one more time');
      return false;
    }

    if (data.match(/<td>Please try again.<br>/)) {
      return false;
    }

    // TODO: How can we make sure it was submitted?

    return true;
  }

  async edit(id: string, text: string) {
    const hmac = await this.fetchHmacForItem(id, 'edit');
    if (!hmac) {
      return false;
    }

    const data = await this.fetch('xedit', {
      method: 'post',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: `id=${id}&hmac=${hmac}&text=${text}`,
    });

    if (data.match(/<td>Please try again.<br>/)) {
      return false;
    }

    // TODO: How can we make sure it was edited?

    return true;
  }

  async delete(id: string) {
    const hmac = await this.fetchHmacForItem(id, 'delete-confirm');

    if (!hmac) {
      return false;
    }
    const data = await this.fetch('xdelete', {
      method: 'post',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: `id=${id}&hmac=${hmac}&d=Yes`,
    });

    if (data.match(/<td>Please try again.<br>/)) {
      return false;
    }

    // TODO: How can we make sure it was deleted?

    return true;
  }

  async post({ title, url, text } = {} as { title: string, url: string, text: string }) {
    const fnidData = await this.fetch('submit');
    const fnid = fnidData.match(/name="fnid" value="([A-Z0-9]*)"/);

    if (fnid && fnid[1]) {
      const data = await this.fetch('r', {
        method: 'post',
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: `fnid=${fnid[1]}&fnop=submit-page&title=${title}&url=${url}&text=${text}`,
      });

      return true;
    }

    // TODO: How can we make sure it was posted?

    return false;
  }

  async submissions(id: string, page: number = 1) {
    const data = await this.fetch(`submitted?id=${id}&p=${page}`);
    const rows = data.match(/class=["']athing["'].*?id=["'](\d+)["']/g) || [];
    const ids = rows.map(item => (item.match(/\d+/) || []).shift());
    return ids.map(id => ({ id })).filter(n => n.id);
  }

  async comments(id: string, fromId?: string) {
    const data = await this.fetch(`threads?id=${id}&next=${fromId}`);
    const rows = data.replace(/\n/g, '').match(/<tr class=['"]athing.*?<\/table><\/td><\/tr>/g);
    return rows.map((row) => {
      const id = row.match(/id=["'](\d+)['"]/);
      const parentId = row.match(/id=(\d+)["']>parent/);
      return {
        id: id && id[1],
        parentId: parentId && parentId[1],
      };
    }).filter(n => n.parentId);
  }

  async hidden(page: number = 1) {
    const data = await this.fetch(`hidden?p=${page}`);
    const rows = data.match(/class=["']athing["'] id=["'](\d+)["']/g) || [];
    const ids = rows.map(item => (item.match(/\d+/) || []).shift());
    return ids.map(id => ({ id })).filter(n => n.id);
  }

  async voted(type: 'submissions' | 'comments', id: string, page: number = 1) {
    const data = await this.fetch(`upvoted?id=${id}&${type}=t&p=${page}`);
    const re = type === 'comments' ?
      /class=["']athing["'] id=["'](\d+)["'].*?parent/g :
      /class=["']athing["'] id=["'](\d+)["']/g;
    const rows = data.replace(/\n/g, '').match(re) || [];
    return rows.map((row) => {
      const parentId = row.match(/id=(\d+)">parent/);
      const id = row.match(/id=['"](\d+)['"]/);
      return {
        id: id && id[1],
        parentId: parentId && parentId[1],
      };
    }).filter(n => type === 'comments' ? n.parentId : !!n);
  }

  async favorites(type: 'submissions' | 'comments', id: string, page: number = 1) {
    const data = await this.fetch(`favorites?id=${id}&${type}=t&p=${page}`);
    const re = type === 'comments' ?
      /class=["']athing["'] id=["'](\d+)["'].*?parent/g :
      /class=["']athing["'] id=["'](\d+)["']/g;
    const rows = data.replace(/\n/g, '').match(re) || [];
    return rows.map((row) => {
      const parentId = row.match(/id=(\d+)">parent/);
      const id = row.match(/id=['"](\d+)['"]/);
      return {
        id: id && id[1],
        parentId: parentId && parentId[1],
      };
    }).filter(n => type === 'comments' ? n.parentId : !!n);
  }
}

export default new Hackernews();
