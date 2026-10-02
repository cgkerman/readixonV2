package com.readixon.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.capacitorjs.plugins.app.AppPlugin;
import io.capawesome.capacitorjs.plugins.googlesignin.GoogleSignInPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppPlugin.class);
        registerPlugin(GoogleSignInPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
