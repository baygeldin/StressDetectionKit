package com.reactivedevicekit

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.medm.devicekit.*

const val MODULE_NAME = "DeviceKit"
const val INIT_ERROR = "INIT_ERROR"
const val PAIR_ERROR = "PAIR_ERROR"

class DeviceKitModule(
        private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = MODULE_NAME

    private val eventEmitter by lazy {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
    }

    private var scannerToken: ScannerStopToken? = null
    private var collectionToken: CollectorStopToken? = null
    private var cancellationTokens = mutableListOf<DeviceAddingCancellationToken>()

    private fun sendEvent(eventName: String, params: Any?) {
        eventEmitter.emit("$MODULE_NAME:$eventName", params)
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
                sendEvent("deviceFound", mapDeviceDescription(device))
            }

            override fun onAmbiguousDeviceFound(devices: Array<IDeviceDescription>) {
                for (d in devices) {
                    sendEvent("ambiguousDeviceFound", mapDeviceDescription(d))
                }
            }

            override fun onScanFinished() {
                sendEvent("scanFinished", null)
            }
        })
    }

    @ReactMethod
    fun stopScan() {
        scannerToken?.stopScan()
    }

    @ReactMethod
    fun addDevice(address: String, name: String, sku: Int, promise: Promise) {
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
                .addDeviceManually(address, name, sku, callback))
    }

    @ReactMethod
    fun removeDevice(address: String) {
        MedMDeviceKit.getDeviceManager().removeDevice(address)
    }

    @ReactMethod
    fun cancelPairing() {
        for (token in cancellationTokens) token.cancel()
    }

    @ReactMethod
    fun startCollection() {
        MedMDeviceKit.getCollector().start(
                object : IDataCallback {
                    override fun onNewData(device: IDeviceDescription, data: String) {
                        sendEvent("data", Arguments.makeNativeMap(mapOf(
                                "data" to data,
                                "device" to mapDeviceDescription(device)
                        )))
                    }

                    override fun onDataCollectionStopped() {
                        sendEvent("collectionFinished", null)
                    }
                },
                object : IDeviceStatusCallback {
                    override fun onConnected(device: IDeviceDescription) {
                        sendEvent("deviceConnected", mapDeviceDescription(device))
                    }

                    override fun onDisconnected(device: IDeviceDescription) {
                        sendEvent("deviceDisconnected", mapDeviceDescription(device))
                    }
                }
        )
    }

    @ReactMethod
    fun stopCollection() {
        collectionToken?.stopCollect()
    }
}
