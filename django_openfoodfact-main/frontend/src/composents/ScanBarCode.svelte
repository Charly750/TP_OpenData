<script>
    import { onMount, onDestroy } from "svelte";
    // @ts-ignore
    import Quagga from "quagga";

    let barcodeResult = "";

    const initQuagga = () => {
        Quagga.init({
            inputStream: {
                type: "LiveStream",
                constraints: {
                    width: 640,
                    height: 480,
                    facingMode: "environment"
                }
            },
            decoder: {
                readers: ["code_128_reader", "ean_reader", "ean_8_reader"]
            }
        // @ts-ignore
        }, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            Quagga.start();
        });

        // @ts-ignore
        Quagga.onDetected(async (data) => {
            window.location.href = `/product/${data.codeResult.code}`
            Quagga.stop();
        });
    };

    const startScanning = () => {
        if (Quagga.initialized) {
            Quagga.start();
        } else {
            initQuagga();
        }
    };

    const stopScanning = () => {
        if (Quagga.initialized) {
            Quagga.stop();
        }
    };

    onMount(() => {
        initQuagga();
    });

    onDestroy(() => {
        stopScanning();
    });
</script>

<div>
    <div id="scanner-container">
        <div id="interactive" class="viewport"></div>
    </div>
    <button on:click={startScanning}>Start Scanning</button>
    <input type="text" bind:value={barcodeResult} readonly />
</div>
