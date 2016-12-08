package de.tr0llhoehle.disease;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Parcel;
import android.os.Parcelable;
import android.util.Log;

/**
 * Captures the complete state of the game;
 * Created by patrick on 11/21/16.
 */

class GameModel extends BroadcastReceiver {
    private static final String TAG = "GameModel";

    private Player current_player = new Player("not connected", 0, 0, 0, 0);
    private Player[] other_players;

    private void updatePlayer(Record record) {
        assert record != null;
        if (record.timestamp > current_player.last_timestamp) {
            current_player.lon = record.lon;
            current_player.lat = record.lat;
            current_player.last_timestamp = record.timestamp;
        }
    }

    private void updateOtherPlayers(Player[] other) {
        other_players = other;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        switch (intent.getAction()) {
            case LocationTracker.UPDATE_RECORD:
                updatePlayer((Record) intent.getParcelableExtra("record"));
                break;
            case SyncService.NEW_REMOTE_STATE:
                Parcelable[] parcelables = intent.getParcelableArrayExtra("players");
                Player[] players = new Player[parcelables.length];
                for (int i = 0; i < parcelables.length; ++i)
                    players[i] = (Player) parcelables[i];
                updateOtherPlayers(players);
                break;
        }
    }

    public Player getPlayer() { return current_player; }
    public Player[] getOther() { return other_players; }


}
