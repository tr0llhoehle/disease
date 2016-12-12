package de.tr0llhoehle.disease;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import static android.content.Context.NOTIFICATION_SERVICE;

/**
 * Created by Hikinggrass on 12/12/2016.
 */

public class Notification {
    static void showNotification(Context context) {
        showNotification(context, "DISEASE", "hello");
    }

    static void showNotification(Context context, String text) {
        showNotification(context, "DISEASE", text);
    }

    static void showNotification(Context context, String title, String text) {
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(NOTIFICATION_SERVICE);

        Intent intent = new Intent(context, MainActivity.class);

        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);

        android.app.Notification.Builder builder = new android.app.Notification.Builder(context)
                .setContentTitle(title)
                .setContentText(text)
                .setSmallIcon(android.R.drawable.ic_delete)
                .setContentIntent(pendingIntent);
        android.app.Notification n;

        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.JELLY_BEAN) {
            n = builder.build();
        } else {
            n = builder.getNotification();
        }

        n.flags |= android.app.Notification.FLAG_NO_CLEAR | android.app.Notification.FLAG_ONGOING_EVENT;

        notificationManager.notify(0, n);
    }
}
