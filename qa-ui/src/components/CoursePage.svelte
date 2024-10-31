<script>
    const courses = ["Svelte", "Astro"];
    const selectQuestion = (course) => {
        window.location.href = `/courses/${course}`; // Redirect to question page
    };
</script>

<ul>
    {#each courses as course}
        <li>
            <button on:click={() => selectQuestion(course)}>{course}</button>
        </li>
    {/each}
</ul>
