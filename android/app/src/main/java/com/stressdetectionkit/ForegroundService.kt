package com.stressdetectionkit

import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.graphics.BitmapFactory
import android.os.IBinder
import android.os.PowerManager
import android.support.v4.app.NotificationCompat

class ForegroundService : Service() {
    private val wakeLock by lazy {
        val pm = getSystemService(POWER_SERVICE) as PowerManager
        pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "WakeLock")
    }

    private val compatNotification by lazy {
        val builder = NotificationCompat.Builder(this)
        val content = resources.getString(R.string.notification_content)
        builder
                .setSmallIcon(R.drawable.splash_image)
                .setLargeIcon(BitmapFactory.decodeResource(resources, R.mipmap.ic_launcher))
                .setContentTitle(resources.getString(R.string.app_name))
                .setContentText(content).setTicker(content)
                .setWhen(System.currentTimeMillis())
        val startIntent = Intent(applicationContext, MainActivity::class.java)
        val contentIntent = PendingIntent.getActivity(this, 1000, startIntent, 0)
        builder.setContentIntent(contentIntent)

        builder.build()
    }

    override fun onCreate() {
        super.onCreate()
        wakeLock.acquire()
    }

    override fun onDestroy() {
        super.onDestroy()
        wakeLock.release()
    }

    override fun onStartCommand(intent: Intent, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, compatNotification)
        return START_STICKY
    }

    override fun onBind(intent: Intent): IBinder? {
        return null
    }

    companion object {
        private val NOTIFICATION_ID = 42
    }
}