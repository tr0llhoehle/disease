package de.tr0llhoehle.disease;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class OnBootReceiver extends BroadcastReceiver {
    public OnBootReceiver() {
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        // start tracking service on boot
        Intent trackingIntent;
        trackingIntent = new Intent(context, de.tr0llhoehle.disease.LocationTracker.class);
        context.startService(trackingIntent);
    }
}
