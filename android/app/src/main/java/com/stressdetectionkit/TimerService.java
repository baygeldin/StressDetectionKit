package com.stressdetectionkit;

import android.annotation.TargetApi;
import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.support.annotation.Nullable;
import android.support.v4.app.NotificationCompat;
import android.support.v4.content.LocalBroadcastManager;

import java.util.Timer;
import java.util.TimerTask;

public class TimerService extends Service {
    public static final String FOREGROUND = "com.stressdetectionkit.FOREGROUND";
    private static int TIMER_NOTIFICATION_ID = 12345689;
    private static final int INTERVAL = 1000;

    private static boolean stopTask;
    private PowerManager.WakeLock mWakeLock;

    @Override
    @TargetApi(Build.VERSION_CODES.M)
    public void onCreate() {
        stopTask = false;

        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        mWakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
                "MyWakelockTag");
        mWakeLock.acquire();

        // Start your (polling) task
        TimerTask task = new TimerTask() {
            @Override
            public void run() {
                if (stopTask){
                    this.cancel();
                }
                sendMessage();
            }
        };
        Timer timer = new Timer();
        timer.scheduleAtFixedRate(task, 0, INTERVAL);
    }

    private void sendMessage() {
        try {
            Intent intent = new Intent("TimerUpdate");
            intent.putExtra("message", "hi");
            LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        stopTask = true;
        if (mWakeLock != null)
            mWakeLock.release();
        super.onDestroy();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForeground(TIMER_NOTIFICATION_ID, getCompatNotification());
        return START_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private Notification getCompatNotification() {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this);
        String str = "Collecting data from sensors";
        builder
                .setSmallIcon(R.drawable.splash_image)
                .setLargeIcon(BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher))
                .setContentTitle("Stress Detection Kit")
                .setContentText(str)
                .setTicker(str)
                .setWhen(System.currentTimeMillis());
        Intent startIntent = new Intent(getApplicationContext(), MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 1000, startIntent, 0);
        builder.setContentIntent(contentIntent);
        return builder.build();
    }
}