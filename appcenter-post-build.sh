if [ ! -z "$IOS_CODEPUSH_APPID" ]; then
  echo "Post build ios"
  cd ios
  fastlane tag_version
  cd -
fi

if [ ! -z "$ANDROID_CODEPUSH_APPID" ]; then
  echo "Post build android"
  cd android
  fastlane tag_version
  cd -
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
