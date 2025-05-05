<script lang="ts">
    import ScanBarCode from "./ScanBarCode.svelte"
    export let isOpen: boolean
    let dialog: HTMLDialogElement

    $: if (isOpen && dialog) dialog.showModal()

</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (isOpen = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<ScanBarCode/>
		<!-- svelte-ignore a11y-autofocus -->
		<button autofocus on:click={() => dialog.close()}>close modal</button>
	</div>
</dialog>