import { readable, writable } from "svelte/store";

let user = localStorage.getItem("userUuid");

if (!user) {
    user = crypto.randomUUID().toString();
    localStorage.setItem("userUuid", user);
}

export const userUuid = readable(user);
export const courseQuestions = writable([]);
export const questionAnswers = writable([]);
