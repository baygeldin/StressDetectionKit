package com.reactivedevicekit

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.medm.devicekit.*

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

class DeviceKitModule(
        private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
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

    private fun sendEvent(eventName: String, params: Any?) {
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
        scannerToken = MedMDeviceKit.getScanner().start(object : IScannerCallback {
            override fun onDeviceFound(device: IDeviceDescription) {
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
        scannerToken?.stopScan()
    }

    @ReactMethod
    fun addDevice(address: String, sku: Int, promise: Promise) {
        val callback = object : IAddDeviceCallback {
            override fun onFailure(device: IDeviceDescription) {
                val device = mapDeviceDescription(device).toString()
                promise.reject(PAIR_ERROR,
                        Exception("The following device could not be paired: $device"))
            }

            override fun onSuccess(device: IDeviceDescription) {
                promise.resolve(null)
            }
        }
        cancellationTokens.add(MedMDeviceKit.getDeviceManager()
                .addDeviceManually(address, sku, callback))
    }

    @ReactMethod
    fun removeDevice(address: String) {
        MedMDeviceKit.getDeviceManager().removeDevice(address)
    }

    @ReactMethod
    fun listDevices(promise: Promise) {
        val devices = MedMDeviceKit.getDeviceManager().devicesList.map { mapDeviceDescription(it) }
        promise.resolve(Arguments.makeNativeArray<WritableMap>(devices.toTypedArray()))
    }

    @ReactMethod
    fun cancelPairings() {
        for (token in cancellationTokens) token.cancel()
    }

    @ReactMethod
    fun startCollection() {
        collectionToken = MedMDeviceKit.getCollector().start(
                object : IDataCallback {
                    override fun onNewData(device: IDeviceDescription, data: String) {
                        sendEvent(DATA_EVENT, Arguments.makeNativeMap(mapOf(
                                "data" to data,
                                "device" to mapDeviceDescription(device)
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
        collectionToken?.stopCollect()
    }
}
