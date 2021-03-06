package de.tr0llhoehle.disease;

import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Intent;
import android.content.Context;
import android.content.IntentFilter;
import android.os.IBinder;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.koushikdutta.async.future.FutureCallback;
import com.koushikdutta.ion.Ion;

import java.util.ArrayList;

public class SyncService extends Service {
    public static final String NEW_REMOTE_STATE = "NEW_REMOTE_STATE";
    private static final String TAG = "SyncService";

    private ArrayList<Record> send_buffer = new ArrayList<>();
    private BroadcastReceiver location_receiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            switch (intent.getAction()) {
                case LocationTracker.UPDATE_RECORD:
                    send_buffer.add((Record) intent.getParcelableExtra("record"));
                    send(context);
                    break;
            }
        }
    };

    @Override
    public synchronized IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        Log.d(TAG, "onCreate");
        LocalBroadcastManager.getInstance(getApplicationContext()).registerReceiver(location_receiver, new IntentFilter(LocationTracker.UPDATE_RECORD));
    }

    @Override
    public synchronized int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Started!");
        return START_STICKY;
    }

    private synchronized void send(final Context context) {
        if (send_buffer.size() == 0) return;

        JsonObject json = new JsonObject();
        JsonArray records = new JsonArray();
        json.add("records", records);

        Gson gson = new GsonBuilder().create();

        for (Record r : send_buffer) {
            JsonObject record  = new JsonObject();
            record.add("lon", gson.toJsonTree(r.lon));
            record.add("lat", gson.toJsonTree(r.lat));
            record.add("timestamp", gson.toJsonTree(r.timestamp));
            record.add("speed", gson.toJsonTree(r.speed));
            record.add("bearing", gson.toJsonTree(r.bearing));
            record.add("accuracy", gson.toJsonTree(r.accuracy));
            records.add(record);
        }
        // FIXME only clear after they arrived
        send_buffer.clear();

        SettingsManager settings = new SettingsManager(context);

        String query = settings.getServer() + "/update/v2/" + settings.getUserId();

        Log.d(TAG, query);

        Ion.with(context)
                .load(query)
                .setJsonObjectBody(json)
                .asJsonObject()
                .setCallback(new FutureCallback<JsonObject>() {
                    @Override
                    public void onCompleted(Exception e, JsonObject result) {
                        if (e != null) {
                            e.printStackTrace();
                            return;
                        }

                        if (result.has("error")) {
                            Log.d(TAG, result.getAsString());
                            return;
                        }

                        JsonArray jsonPlayers = result.getAsJsonArray("players");
                        Player[] players = new Player[jsonPlayers.size()];
                        for (int idx = 0; idx < jsonPlayers.size(); idx++) {
                            JsonObject jsonPlayer = jsonPlayers.get(idx).getAsJsonObject();
                            players[idx] = new Player(jsonPlayer.getAsJsonPrimitive("uid").getAsString(),
                                    jsonPlayer.getAsJsonPrimitive("lon").getAsDouble(),
                                    jsonPlayer.getAsJsonPrimitive("lat").getAsDouble(),
                                    jsonPlayer.getAsJsonPrimitive("timestamp").getAsLong(),
                                    jsonPlayer.getAsJsonPrimitive("state").getAsInt());
                        }

                        Intent intent = new Intent(SyncService.NEW_REMOTE_STATE);
                        intent.putExtra("players", players);
                        LocalBroadcastManager.getInstance(getApplicationContext()).sendBroadcast(intent);
                        // todo update internal state to server state
                    }
                });
    }
}
