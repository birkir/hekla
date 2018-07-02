import firebase from 'react-native-firebase';

const connectedRef = firebase.database().ref('.info');
connectedRef.on('value', (s: any) => {
  // const val = s.val();
  // val.connected?
});

export const db = firebase.database();

// Couple of use-cases.
// 1. Normal fetching. Resolve as fast as possible.
// 1a. Wh00t... Same list as 10 minutes ago?
// 2. I want latest. Give me latest. I can wait.
// 3. OK never mind. I don't have internet now. Just cancel that and give me cache.
// 4. I am iterating over multiple items and can't wait for all of
//    them to resolve latest. So let's rather get fast version, then
//    in background fetch latest and update our item behind the scenes
//    (should maybe be done in another place, yeh?)
export const fetchRef = (ref: any, timeout: number = 750) => new Promise((resolve) => {

  let state = 0;
  let fallback;
  let snapshot;

  const resolveSnapshot = () => {
    resolve(snapshot.val());
    ref.off();
  };

  ref.once('value', (s) => {
    snapshot = s;
    if (timeout === 0) {
      fallback = setTimeout(resolveSnapshot, 5);
    }
  });

  ref.on('value', (s) => {

    // Dont run fallback
    clearTimeout(fallback);

    // Store latest snapshot
    snapshot = s;

    if (timeout === 0 || state > 0) {
      resolveSnapshot();
    } else if (state === 0) {
      // Check if timeout is set
      if (timeout !== Infinity) {
        fallback = setTimeout(resolveSnapshot, timeout);
      }
    }

    // Increment state
    state += 1;
  });
});
