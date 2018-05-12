package com.stressdetectionkit

import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ForegroundModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "Foreground"

    @ReactMethod
    fun startService(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, ForegroundService::class.java)
            reactApplicationContext.startService(intent)
        } catch (e: Exception) {
            promise.reject(e)
            return
        }
        promise.resolve(null)
    }

    @ReactMethod
    fun stopService(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, ForegroundService::class.java)
            reactApplicationContext.stopService(intent)
        } catch (e: Exception) {
            promise.reject(e)
            return
        }
        promise.resolve(null)
    }
}