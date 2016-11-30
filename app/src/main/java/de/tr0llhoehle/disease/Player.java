package de.tr0llhoehle.disease;

import android.os.Parcel;
import android.os.Parcelable;

/**
 * Created by patrick on 11/30/16.
 */

public class Player implements Parcelable {
    public String uid;
    public double lon;
    public double lat;
    public long last_timestamp;

    Player(String uid, double lon, double lat, long last_timestamp) {
        this.uid = uid;
        this.lon = lon;
        this.lat = lat;
        this.last_timestamp = last_timestamp;
    }

    public int describeContents() {
        return 0;
    }

    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(uid);
        dest.writeDouble(lon);
        dest.writeDouble(lat);
        dest.writeLong(last_timestamp);
    }

    private Player(Parcel in) {
        this.uid = in.readString();
        this.lon = in.readDouble();
        this.lat = in.readDouble();
        this.last_timestamp = in.readLong();
    }

    public static final Parcelable.Creator<Player> CREATOR = new Parcelable.Creator<Player>() {
        public Player createFromParcel(Parcel in) {
            return new Player(in);
        }

        public Player[] newArray(int size) {
            return new Player[size];
        }
    };
}
