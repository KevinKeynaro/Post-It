<script>
  let count = 0;

  function increment() {
    count += 1;
  }
</script>

<main>
  <h1>Post It Frontend</h1>
  <button on:click={increment}>
    Clicks: {count}
  </button>
</main>

<style>
  main {
    text-align: center;
    padding: 2rem;
    font-family: sans-serif;
  }
  button {
    font-size: 1rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
</style>
