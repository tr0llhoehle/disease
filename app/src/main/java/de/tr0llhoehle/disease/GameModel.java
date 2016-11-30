package de.tr0llhoehle.disease;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Captures the complete state of the game;
 * Created by patrick on 11/21/16.
 */

class GameModel extends BroadcastReceiver {
    private static final String TAG = "GameModel";

    private Player current_player = new Player("not connected", 0, 0, 0);

    private void updatePlayer(Record record) {
        if (record.timestamp > current_player.last_timestamp) {
            current_player.lon = record.lon;
            current_player.lat = record.lat;
            current_player.last_timestamp = record.timestamp;
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        switch (intent.getAction()) {
            case LocationTracker.UPDATE_RECORD:
                updatePlayer((Record) intent.getParcelableExtra("record"));
                break;
        }
    }

    public Player getPlayer() { return current_player; }

}
