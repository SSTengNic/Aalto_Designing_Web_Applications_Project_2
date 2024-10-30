<script>
    const getAllCourseOneQuestions = async () => {
        const response = await fetch("/api/courseonequestions");
        return await response.json();
    };

    let courseOneQuestionsPromise = getAllCourseOneQuestions();

    let dummyDatas = [];
    dummyDatas = [
        { id: 1, content: "Question 1?", upvotes: 5 },
        { id: 2, content: "Question 2?", upvotes: 10 },
    ];

    const upvoteQuestion = (id) => {
        const dummyData = dummyDatas.find((q) => q.id === id);
        if (dummyData) {
            dummyData.upvotes += 1;
        }
    };

    const selectQuestion = (id) => {
        window.location.href = `/questions/${id}`; // Redirect to question page
    };
</script>

<ul>
    {#await courseOneQuestionsPromise}
        <p>Loading questions...</p>
    {:then courseOneQuestions}
        {#each courseOneQuestions as question (question.id)}
            <li>
                <p>{question.content}</p>
                <p>Upvotes: {question.upvotes}</p>
                <button on:click={() => upvoteQuestion(question.id)}
                    >Upvote</button
                >
                <button on:click={() => selectQuestion(question.id)}
                    >Go to Question</button
                >
            </li>
        {/each}
    {:catch error}
        <p>Error loading items: {error.message}</p>
    {/await}
</ul>
