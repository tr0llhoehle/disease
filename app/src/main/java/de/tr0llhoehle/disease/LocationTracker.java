package de.tr0llhoehle.disease;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationListener;

import android.util.Log;
import android.app.Service;
import android.content.Intent;
import android.location.Location;
import android.os.HandlerThread;
import android.os.IBinder;
import android.os.Bundle;

import java.util.ArrayList;

public class LocationTracker extends Service implements GoogleApiClient.ConnectionCallbacks, GoogleApiClient.OnConnectionFailedListener, LocationListener {
    // all values in milliseconds
    private static final int SEND_INTERVAL = 1000;
    private static final int UPDATE_INTERVAL = 1000;
    private static final int FASTEST_UPDATE_INTERVAL = 100;
    private static final String TAG = "location tracker";

    private GoogleApiClient googleClient;
    private ArrayList<Location> bufferedLocations;
    private HandlerThread locationHandlerThread;
    private long lastFlush = 0;

    public LocationTracker() {
        this.googleClient = new GoogleApiClient.Builder(this)
                .addApi(LocationServices.API)
                .addConnectionCallbacks(this)
                .addOnConnectionFailedListener(this)
                .build();
        this.googleClient.connect();
    }

    private void sendBuffer() {
        /* TODO implement sending over HTTP */
        bufferedLocations.clear();
    }

    private void addToBuffer(Location location) {
        bufferedLocations.add(location);

        if (location.getTime() - lastFlush > SEND_INTERVAL) {
            sendBuffer();
            bufferedLocations.clear();
            lastFlush = location.getTime();
        }
    }

    @Override
    public synchronized void onLocationChanged(Location location) {
        Log.d(TAG, "Location update!");

        addToBuffer(location);
    }

    @Override
    public synchronized void onConnectionFailed(ConnectionResult result) {
        Log.d(TAG, "Connection failed");
    }

    @Override
    public synchronized void onConnected(Bundle bundle) {
        Log.d(TAG, "Connected");

        locationHandlerThread = new HandlerThread("Location Handler Thread", android.os.Process.THREAD_PRIORITY_BACKGROUND);
        locationHandlerThread.start();

        LocationRequest req;
        req = new LocationRequest();
        req.setInterval(UPDATE_INTERVAL);
        req.setFastestInterval(FASTEST_UPDATE_INTERVAL);

        Log.d(TAG, "Starting updates");

        LocationServices.FusedLocationApi.requestLocationUpdates(googleClient, req, this, locationHandlerThread.getLooper());
    }

    @Override
    public synchronized void onConnectionSuspended(int value) {
        Log.d(TAG, "Connection suspended");

        googleClient.connect();
    }

    @Override
    public synchronized IBinder onBind(Intent intent) {
        return null;
    }

}
