# Cancel builds with [skip ci] as AppCenter's Build Machines don't currently do this.
COMMIT_MESSAGE=$(git log -1 --pretty=%B)
APPCENTER_APPID=""

if [ ! -z "$IOS_CODEPUSH_APPID" ]; then
  APPCENTER_APPID="$IOS_CODEPUSH_APPID"
fi

if [ ! -z "$ANDROID_CODEPUSH_APPID" ]; then
  APPCENTER_APPID="$ANDROID_CODEPUSH_APPID"
fi

echo "COMMIT_MESSAGE = - $COMMIT_MESSAGE -"
echo "APPCENTER_APPID = $APPCENTER_APPID"

if [[ $COMMIT_MESSAGE = *"[skip ci]"* ]]; then
  echo "SKIP_CI = true"
  curl -X PATCH "https://api.appcenter.ms/v0.1/apps/$APPCENTER_APPID/builds/$APPCENTER_BUILD_ID" -H "accept: application/json" -H "X-API-Token: $APPCENTER_API_KEY" -H "Content-Type: application/json" -d "{ \"status\": \"cancelling\" }"
else
  echo "SKIP_CI = false"
fi


set -ex
brew uninstall node@6
NODE_VERSION="8.11.3"
curl "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}.pkg" > "$HOME/Downloads/node-installer.pkg"
sudo installer -store -pkg "$HOME/Downloads/node-installer.pkg" -target "/"

echo "Identifying selected node version..."
node --version

which node
