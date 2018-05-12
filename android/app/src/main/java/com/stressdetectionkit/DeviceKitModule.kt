package com.stressdetectionkit

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.medm.devicekit.*

class DeviceKitModule(
        private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        const val MODULE_NAME = "DeviceKit"

        const val INIT_ERROR = "INIT_ERROR"
        const val PAIR_ERROR = "PAIR_ERROR"

        const val EVENT_PREFIX = MODULE_NAME
        const val DATA_EVENT = "data"
        const val DEVICE_FOUND_EVENT = "deviceFound"
        const val DEVICE_CONNECTED_EVENT = "deviceConnected"
        const val DEVICE_DISCONNECTED_EVENT = "deviceDisconnected"
        const val AMBIGUOUS_DEVICE_FOUND_EVENT = "ambiguousDeviceFound"
        const val SCAN_FINISHED_EVENT = "scanFinished"
        const val COLLECTION_FINISHED_EVENT = "collectionFinished"
    }

    override fun getName() = MODULE_NAME

    override fun getConstants() = mapOf(
            "EVENT_PREFIX" to EVENT_PREFIX,
            "EVENTS" to listOf(
                    DATA_EVENT, DEVICE_FOUND_EVENT, DEVICE_CONNECTED_EVENT,
                    DEVICE_DISCONNECTED_EVENT, AMBIGUOUS_DEVICE_FOUND_EVENT,
                    SCAN_FINISHED_EVENT, COLLECTION_FINISHED_EVENT
            )
    )

    private val eventEmitter by lazy {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
    }

    private var scannerToken: ScannerStopToken? = null
    private var collectionToken: CollectorStopToken? = null
    private var cancellationTokens = mutableListOf<DeviceAddingCancellationToken>()

    private var foundDevices = mutableListOf<IDeviceDescription>()

    private fun sendEvent(eventName: String, params: Any?) {
        Log.i(APP_TAG, "Send '$eventName' event.")
        eventEmitter.emit("$EVENT_PREFIX:$eventName", params)
    }

    private fun mapDeviceDescription(device: IDeviceDescription): WritableMap =
            Arguments.makeNativeMap(mapOf(
                    "id" to device.sku,
                    "address" to device.address,
                    "name" to device.name,
                    "modelName" to device.modelName,
                    "manufacturer" to device.manufacturer
            ))

    @ReactMethod
    fun init(key: String, promise: Promise) {
        try {
            MedMDeviceKit.init(reactContext.currentActivity?.application, key)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(INIT_ERROR, e)
        }
    }

    @ReactMethod
    fun startScan() {
        Log.i(APP_TAG, "Start scanning for devices.")
        scannerToken = MedMDeviceKit.getScanner().start(object : IScannerCallback {
            override fun onDeviceFound(device: IDeviceDescription) {
                foundDevices.add(device)
                sendEvent(DEVICE_FOUND_EVENT, mapDeviceDescription(device))
            }

            override fun onAmbiguousDeviceFound(devices: Array<IDeviceDescription>) {
                for (d in devices) {
                    sendEvent(AMBIGUOUS_DEVICE_FOUND_EVENT, mapDeviceDescription(d))
                }
            }

            override fun onScanFinished() {
                sendEvent(SCAN_FINISHED_EVENT, null)
            }
        })
    }

    @ReactMethod
    fun stopScan() {
        Log.i(APP_TAG, "Stop scanning for devices.")
        scannerToken?.stopScan()
    }

    @ReactMethod
    fun addDevice(sku: Int, promise: Promise) {
        val callback = object : IAddDeviceCallback {
            override fun onFailure(device: IDeviceDescription) {
                val deviceString = mapDeviceDescription(device).toString()
                promise.reject(PAIR_ERROR,
                        Exception("The following device could not be paired: $deviceString"))
            }

            override fun onSuccess(device: IDeviceDescription) {
                promise.resolve(null)
            }
        }
        val device = foundDevices.find { it.sku == sku }!!
        Log.i(APP_TAG, "Pair ${device.modelName} device with ${device.sku} SKU.")
        cancellationTokens.add(MedMDeviceKit.getDeviceManager().addDevice(device, callback))
    }

    @ReactMethod
    fun removeDevice(address: String) {
        Log.i(APP_TAG, "Remove device with $address address.")
        MedMDeviceKit.getDeviceManager().removeDevice(address)
    }

    @ReactMethod
    fun listDevices(promise: Promise) {
        val devices = MedMDeviceKit.getDeviceManager().devicesList.map { mapDeviceDescription(it) }
        promise.resolve(Arguments.makeNativeArray<WritableMap>(devices.toTypedArray()))
    }

    @ReactMethod
    fun cancelPairings() {
        Log.i(APP_TAG, "Cancel all pairings.")
        for (token in cancellationTokens) token.cancel()
    }

    @ReactMethod
    fun startCollection() {
        Log.i(APP_TAG, "Start data collection.")
        collectionToken = MedMDeviceKit.getCollector().start(
                object : IDataCallback {
                    override fun onNewData(device: IDeviceDescription?, data: String) {
                        val deviceMap = if (device != null) mapDeviceDescription(device) else null
                        sendEvent(DATA_EVENT, Arguments.makeNativeMap(mapOf(
                                "data" to data,
                                "device" to deviceMap
                        )))
                    }

                    override fun onDataCollectionStopped() {
                        sendEvent(COLLECTION_FINISHED_EVENT, null)
                    }
                },
                object : IDeviceStatusCallback {
                    override fun onConnected(device: IDeviceDescription) {
                        sendEvent(DEVICE_CONNECTED_EVENT, mapDeviceDescription(device))
                    }

                    override fun onDisconnected(device: IDeviceDescription) {
                        sendEvent(DEVICE_DISCONNECTED_EVENT, mapDeviceDescription(device))
                    }
                }
        )
    }

    @ReactMethod
    fun stopCollection() {
        Log.i(APP_TAG, "Stop data collection.")
        collectionToken?.stopCollect()
    }
}
