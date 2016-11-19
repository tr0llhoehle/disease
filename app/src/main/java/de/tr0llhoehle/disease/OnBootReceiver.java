package de.tr0llhoehle.disease;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class OnBootReceiver extends BroadcastReceiver {
    private static final String TAG = "boot receiver";

    public OnBootReceiver() {
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "Connection suspended");

        // start tracking service on boot
        Intent trackingIntent;
        trackingIntent = new Intent(context, LocationTracker.class);
        context.startService(trackingIntent);
    }
}
