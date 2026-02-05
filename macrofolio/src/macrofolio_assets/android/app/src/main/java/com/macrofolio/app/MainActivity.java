package com.macrofolio.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle; // Add this import

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // RevenueCat is now initialized in the web layer via the Capacitor plugin.
        // No direct initialization code is needed here anymore.
    }
}
