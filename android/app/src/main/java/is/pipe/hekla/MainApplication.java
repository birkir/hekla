package is.pipe.hekla;

import android.app.Application;
import android.content.Context;
import android.support.multidex.MultiDex;

import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage;
import io.invertase.firebase.database.RNFirebaseDatabasePackage;
import io.invertase.firebase.firestore.RNFirebaseFirestorePackage;
import io.sentry.RNSentryPackage;
import com.microsoft.codepush.react.ReactInstanceHolder;
import com.microsoft.codepush.react.CodePush;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.psykar.cookiemanager.CookieManagerPackage;
import com.reactlibrary.RNReactNativeHapticFeedbackPackage;
import com.oblador.keychain.KeychainPackage;
import com.wix.interactable.Interactable;
import com.github.droibit.android.reactnative.customtabs.CustomTabsPackage;
import com.RNRate.RNRatePackage;
import com.dooboolab.RNIap.RNIapPackage;
import com.apsl.versionnumber.RNVersionNumberPackage;
import com.aakashns.reactnativedialogs.ReactNativeDialogsPackage;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        MultiDex.install(this);
    }

    @Override
    protected ReactGateway createReactGateway() {
        ReactNativeHost host = new NavigationReactNativeHost(this, isDebug(), createAdditionalReactPackages()) {
            @javax.annotation.Nullable
            @Override
            protected String getJSBundleFile() {
                return CodePush.getJSBundleFile();
            }
        };
        return new ReactGateway(this, isDebug(), host);
    }

    @Override
    public boolean isDebug() {
        return BuildConfig.DEBUG;
    }

    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
          new CodePush(BuildConfig.ANDROID_CODEPUSH_DEPLOYMENT_KEY, MainApplication.this, BuildConfig.DEBUG),
          new ReactNativeConfigPackage(),
          new KeychainPackage(),
          new Interactable(),
          new FastImageViewPackage(),
          new CookieManagerPackage(),
          new RNSentryPackage(),
          new RNReactNativeHapticFeedbackPackage(),
          new CustomTabsPackage(),
          new RNRatePackage(),
          new RNIapPackage(),
          new RNVersionNumberPackage(),
          new ReactNativeDialogsPackage(),
          new RNFirebasePackage(),
          new RNFirebaseAnalyticsPackage(),
          new RNFirebaseDatabasePackage(),
          new RNFirebaseFirestorePackage()
        );
    }

    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
        return getPackages();
    }
}
