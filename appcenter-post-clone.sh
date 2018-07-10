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

# Install NVM
brew install nvm
source $(brew --prefix nvm)/nvm.sh

# Install node (Latest LTS: Carbon)
nvm install v8.11.3
nvm use --delete-prefix v8.11.3
nvm alias default v8.11.3

echo "Identifying selected node version..."
node --version
