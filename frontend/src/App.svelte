<script>
  import { onMount } from 'svelte';

  let apiStatus = null;
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      apiStatus = await res.json();
      console.log('App.svelte fetched:', apiStatus);
    } catch (err) {
      error = err.message;
      console.error('App.svelte fetch error:', err);
    } finally {
      loading = false;
    }
  });
</script>

<main>
  <h1>Post It Frontend</h1>

  <section class="status-card">
    <h2>Backend Status</h2>
    {#if loading}
      <p>Connecting to backend...</p>
    {:else if error}
      <p class="error">Failed to connect: {error}</p>
    {:else}
      <pre>{JSON.stringify(apiStatus, null, 2)}</pre>
    {/if}
  </section>
</main>

<style>
  main {
    text-align: center;
    padding: 2rem;
    font-family: sans-serif;
  }
  .status-card {
    display: inline-block;
    margin-top: 1.5rem;
    padding: 1.5rem 2rem;
    border-radius: 8px;
    background: #f4f4f4;
    text-align: left;
  }
  .error {
    color: #e53e3e;
  }
  pre {
    background: #ffffff;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
</style>
