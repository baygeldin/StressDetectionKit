package com.reactivedevicekit

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.medm.devicekit.*

class DeviceKitModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var eventEmitter : DeviceEventManagerModule.RCTDeviceEventEmitter? = null

    private var scannerToken: ScannerStopToken? = null

    override fun getName() = "DeviceKit"

    override fun getConstants() = mapOf("DEMO" to "DEMO")

    fun sendEvent(eventName: String, params: WritableMap) {
        eventEmitter?.emit("DeviceKit:$eventName", params)
    }

    fun mapDeviceDescription(device: IDeviceDescription): WritableMap = Arguments.makeNativeMap(mapOf(
            "id" to device.sku,
            "address" to device.address,
            "name" to device.name,
            "modelName" to device.modelName,
            "manufacturer" to device.manufacturer
    ))

    @ReactMethod
    fun startScan() {
        MedMDeviceKit.init(reactContext.currentActivity?.application, "device-kit-demo-key")
        eventEmitter = reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        scannerToken = MedMDeviceKit.getScanner().start(object : IScannerCallback {
            override fun onDeviceFound(device: IDeviceDescription) {
                sendEvent("deviceFound", mapDeviceDescription(device))
            }

            override fun onAmbiguousDeviceFound(devices: Array<IDeviceDescription>) {
                for (d in devices) {
                    sendEvent("ambiguousDeviceFound", mapDeviceDescription(d))
                }
            }

            override fun onScanFinished() {}
        })
    }

    @ReactMethod
    fun stopScan() {
        scannerToken?.stopScan()
    }
}
